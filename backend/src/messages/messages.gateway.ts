import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessagesService } from './messages.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://suqly.com'],
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private users = new Map<number, string>();

  constructor(private messagesService: MessagesService) {}

  afterInit(server: any) {
    console.log('🔌 WebSocket Server initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    console.log(`✅ Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.users.delete(client.userId);
    }
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: number },
  ) {
    client.userId = data.userId;
    this.users.set(data.userId, client.id);
    client.emit('joined', { userId: data.userId });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      listingId: number;
      recipientId: number;
      content: string;
    },
  ) {
    if (!client.userId) {
      return client.emit('error', { message: 'Not authenticated' });
    }

    const message = await this.messagesService.createMessage(
      data.listingId,
      client.userId,
      data.recipientId,
      data.content,
    );

    const recipientSocketId = this.users.get(data.recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('message', {
        id: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        listingId: message.listingId,
        content: message.content,
        createdAt: message.createdAt,
      });
    }

    client.emit('message_sent', {
      id: message.id,
      recipientId: data.recipientId,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { recipientId: number; isTyping: boolean },
  ) {
    const recipientSocketId = this.users.get(data.recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('user_typing', {
        userId: client.userId,
        isTyping: data.isTyping,
      });
    }
  }
}
