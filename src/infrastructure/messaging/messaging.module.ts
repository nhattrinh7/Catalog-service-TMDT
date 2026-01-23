import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MESSAGE_PUBLISHER } from '~/domain/contracts/message-publisher.interface'
import { RabbitMQPublisher } from '~/infrastructure/messaging/publishers/rabbitmq.publisher'

@Module({
  imports: [
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
    ]),
  ],
  providers: [
    {
      provide: MESSAGE_PUBLISHER,
      useClass: RabbitMQPublisher,
    },
  ],
  exports: [ClientsModule, MESSAGE_PUBLISHER],
})
export class MessagingModule {}
