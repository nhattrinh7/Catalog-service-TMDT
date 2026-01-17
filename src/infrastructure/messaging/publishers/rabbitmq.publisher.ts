import { Injectable, Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs/internal/lastValueFrom'
import { IMessagePublisher } from '~/domain/contracts/message-publisher.interface'

@Injectable()
export class RabbitMQPublisher implements IMessagePublisher {
  constructor(
    @Inject('NOTIFICATION_CLIENT') 
    private readonly notificationClient: ClientProxy,
    @Inject('INVENTORY_CLIENT') 
    private readonly inventoryClient: ClientProxy,
  ) {}

  emitToInventoryService<T>(pattern: string, event: T): void {
    this.inventoryClient.emit(pattern, event)
  }

  async sendToInventoryService<T, R = any>(pattern: string, data: T): Promise<R> {
    const response$ = this.inventoryClient.send<R, T>(pattern, data) // dấu $ là convention của coder, ko bắt buộc
    return lastValueFrom(response$)
  }
}