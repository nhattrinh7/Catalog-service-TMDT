import { Injectable, Inject, Logger } from '@nestjs/common'
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs/internal/lastValueFrom'
import { IMessagePublisher } from '~/domain/contracts/message-publisher.interface'
import { getKongRequestId } from '~/common/context/request-context'

@Injectable()
export class RabbitMQPublisher implements IMessagePublisher {
  private readonly logger = new Logger(RabbitMQPublisher.name) // RabbitMQPublisher.name = RabbitMQPublisher

  constructor(
    @Inject('NOTIFICATION_CLIENT')
    private readonly notificationClient: ClientProxy,
    @Inject('INVENTORY_CLIENT')
    private readonly inventoryClient: ClientProxy,
    @Inject('USER_CLIENT')
    private readonly userClient: ClientProxy,
    @Inject('SHOP_CLIENT')
    private readonly shopClient: ClientProxy,
    @Inject('SAGA_CLIENT')
    private readonly sagaClient: ClientProxy,
  ) {}

  private buildRecord<T>(event: T) {
    return new RmqRecordBuilder(event)
      .setOptions({
        headers: { 'kong-request-id': getKongRequestId() },
      })
      .build()
  }

  emitToSagaOrchestrator<T>(pattern: string, event: T): void {
    this.logger.debug(`[${getKongRequestId()}] Emit ${pattern} → saga-orchestrator`)
    this.sagaClient.emit(pattern, this.buildRecord(event))
  }

  emitToInventoryService<T>(pattern: string, event: T): void {
    this.logger.debug(`[${getKongRequestId()}] Emit ${pattern} → inventory-service`)
    this.inventoryClient.emit(pattern, this.buildRecord(event))
  }

  async sendToInventoryService<T, R = any>(pattern: string, data: T): Promise<R> {
    this.logger.debug(`[${getKongRequestId()}] Send ${pattern} → inventory-service`)
    const response$ = this.inventoryClient.send<R, T>(pattern, this.buildRecord(data) as any)
    return lastValueFrom(response$)
  }

  async sendToUserService<T, R = any>(pattern: string, data: T): Promise<R> {
    this.logger.debug(`[${getKongRequestId()}] Send ${pattern} → user-service`)
    const response$ = this.userClient.send<R, T>(pattern, this.buildRecord(data) as any)
    return lastValueFrom(response$)
  }

  async sendToShopService<T, R = any>(pattern: string, data: T): Promise<R> {
    this.logger.debug(`[${getKongRequestId()}] Send ${pattern} → shop-service`)
    const response$ = this.shopClient.send<R, T>(pattern, this.buildRecord(data) as any)
    return lastValueFrom(response$)
  }
}
