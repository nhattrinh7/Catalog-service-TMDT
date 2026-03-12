import { Logger } from '@nestjs/common'
import { RmqContext } from '@nestjs/microservices'
import { v4 as uuidv4 } from 'uuid'
import { requestContext } from '~/common/context/request-context'

export abstract class BaseRetryConsumer {
  protected readonly maxRetries = 3
  protected readonly baseDelay = 1000
  protected readonly logger = new Logger(this.constructor.name)

  protected async handleWithRetry<T>(
    context: RmqContext,
    handler: () => Promise<T>,
  ): Promise<T | undefined> {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    const retryCount = originalMsg.properties.headers?.['x-retry-count'] || 0
    const kongRequestId = originalMsg.properties.headers?.['kong-request-id'] || uuidv4()

    return requestContext.run({ kongRequestId }, async () => {
      if (retryCount > this.maxRetries) {
        this.logger.error(`[kongRequestId=${kongRequestId}] Max retries (${this.maxRetries}) exceeded, sending to DLQ`)
        const serviceName = process.env.SERVICE_NAME || 'unknown-service'
        channel.publish('events_exchange', `dlq.${serviceName}`, originalMsg.content, {
          persistent: true,
          headers: {
            'x-original-exchange': 'events_exchange',
            'x-original-routing-key': context.getPattern(),
            'x-service': serviceName,
            'x-retry-count': retryCount,
            'x-failed-at': new Date().toISOString(),
            'kong-request-id': kongRequestId,
          },
        })
        channel.ack(originalMsg) // báo cho RabbitMQ xóa cái message khỏi hàng đợi chính đi (vì ta có 1 bản sao ở DLQ rồi)
        return undefined // thoát khỏi luồng chạy 
      }

      try {
        const result = await handler()
        channel.ack(originalMsg) // handler xử lí xong thành công thì ack về để báo đã xử lí ngon lành và xóa message khỏi queue
        this.logger.log(`[kongRequestId=${kongRequestId}] Message processed successfully`)
        return result
      } catch {
        const baseDelayForRetry = this.baseDelay * Math.pow(2, retryCount)
        const minDelay = baseDelayForRetry * 0.75
        const maxDelay = baseDelayForRetry * 1.25
        const jitterDelay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay))
        const originalRoutingKey =
          originalMsg.properties.headers?.['x-original-routing-key'] || context.getPattern()
        this.logger.warn(`[kongRequestId=${kongRequestId}] Retry ${retryCount + 1}/${this.maxRetries} after ${jitterDelay}ms — routing: ${originalRoutingKey}`)
        setTimeout(() => {
          channel.publish('events_exchange', originalRoutingKey, originalMsg.content, {
            persistent: true,
            headers: {
              ...originalMsg.properties.headers,
              'x-retry-count': retryCount + 1,
              'x-original-routing-key': originalRoutingKey,
              'kong-request-id': kongRequestId,
            },
          })
        }, jitterDelay)
        channel.ack(originalMsg) // xóa cái message vừa xử lí lỗi khỏi hàng đợi chính đi, nếu không
                                 // tí mình push lại 1 message lại để retry thì bị thành 2 message nằm trong hàng đợi chính
        return undefined // thoát khỏi luồng chạy 
      }
    })
  }
}

/**
 * Việc gọi ack hay nack là nói cho RabbitMQ biết, chứ thằng service gọi nó fire-and-forget rồi, nó bắn event xong éo quan tâm nữa.
 * Và quan trọng là nếu dùng nack thì việc bắn lại message vào queue chính hay bắn vào DLQ là RabbitMQ làm tự động mình ko thêm các 
 * custom headers được.
 */