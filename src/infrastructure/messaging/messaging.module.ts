import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MESSAGE_PUBLISHER } from '~/domain/contracts/message-publisher.interface'
import { RabbitMQPublisher } from '~/infrastructure/messaging/publishers/rabbitmq.publisher'
import { GetVariantInfoConsumer } from '~/infrastructure/messaging/consumers/get-variant-info.consumer'
import { GetProductsWithLevel1CategoriesConsumer } from '~/infrastructure/messaging/consumers/get-products-with-level1-categories.consumer'
import { GetVariantsBatchConsumer } from '~/infrastructure/messaging/consumers/get-variants-batch.consumer'
import { GetDescendantCategoryIdsConsumer } from '~/infrastructure/messaging/consumers/get-descendant-category-ids.consumer'
import { SagaValidateItemsConsumer } from '~/infrastructure/messaging/consumers/saga-validate-items.consumer'
import { GetReviewedOrderItemsConsumer } from '~/infrastructure/messaging/consumers/get-reviewed-order-items.consumer'

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATION_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'notification_queue',
          persistent: true,
        },
      },
      {
        name: 'INVENTORY_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'inventory_queue',
          persistent: true,
        },
      },
      {
        name: 'USER_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'user_queue',
          persistent: true,
        },
      },
      {
        name: 'SHOP_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'shop_queue',
          persistent: true,
        },
      },
      {
        name: 'SAGA_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'saga_queue',
          persistent: true,
        },
      },
    ]),
  ],
  providers: [
    {
      provide: MESSAGE_PUBLISHER,
      useClass: RabbitMQPublisher,
    },
  ],
  controllers: [
    GetVariantInfoConsumer,
    GetProductsWithLevel1CategoriesConsumer,
    GetVariantsBatchConsumer,
    GetDescendantCategoryIdsConsumer,
    SagaValidateItemsConsumer,
    GetReviewedOrderItemsConsumer,
  ],
  exports: [ClientsModule, MESSAGE_PUBLISHER],
})
export class MessagingModule {}
