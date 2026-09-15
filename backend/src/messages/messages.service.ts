import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async createMessage(
    listingId: number,
    senderId: number,
    recipientId: number,
    content: string,
  ): Promise<Message> {
    const message = this.messagesRepository.create({
      listingId,
      senderId,
      recipientId,
      content,
    });

    return this.messagesRepository.save(message);
  }

  async getMessagesForListing(
    listingId: number,
    page = 1,
    limit = 50,
  ): Promise<any> {
    const [messages, total] = await this.messagesRepository.findAndCount({
      where: { listingId },
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: messages.reverse(),
      total,
      page,
      limit,
    };
  }

  async getConversation(
    senderId: number,
    recipientId: number,
    page = 1,
    limit = 50,
  ): Promise<any> {
    const messages = await this.messagesRepository.find({
      where: [
        { senderId, recipientId },
        { senderId: recipientId, recipientId: senderId },
      ],
      relations: ['sender', 'recipient', 'listing'],
      order: { createdAt: 'DESC' },
    });

    const total = messages.length;

    return {
      data: messages.slice((page - 1) * limit, page * limit).reverse(),
      total,
      page,
      limit,
    };
  }

  async markAsRead(messageId: number): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isRead = true;
    message.readAt = new Date();

    return this.messagesRepository.save(message);
  }

  async getUserConversations(userId: number): Promise<any[]> {
    const messages = await this.messagesRepository
      .createQueryBuilder('m')
      .where('m.senderId = :userId OR m.recipientId = :userId', { userId })
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.recipient', 'recipient')
      .leftJoinAndSelect('m.listing', 'listing')
      .orderBy('m.createdAt', 'DESC')
      .getMany();

    // Group by conversation partner
    const conversations = new Map();

    messages.forEach((msg) => {
      const partnerId =
        msg.senderId === userId ? msg.recipientId : msg.senderId;
      const key = `${Math.min(userId, partnerId)}-${Math.max(userId, partnerId)}`;

      if (!conversations.has(key)) {
        conversations.set(key, {
          partnerId,
          lastMessage: msg,
          messages: [],
        });
      }
      conversations.get(key).messages.push(msg);
    });

    return Array.from(conversations.values());
  }
}
