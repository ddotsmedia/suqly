import { Controller, Post, Get, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseService } from './firebase.service';
import { JwtGuard } from '../auth/jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private firebaseService: FirebaseService,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  @Post('subscribe')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  async subscribe(
    @Body() body: { fcmToken: string; topics?: string[] },
    @Request() req: any,
  ) {
    const defaultTopics = ['listings', 'messages', 'offers'];
    const topics = body.topics || defaultTopics;

    for (const topic of topics) {
      await this.firebaseService.subscribeToTopic(req.user.id, body.fcmToken, topic);
    }

    return {
      success: true,
      data: { topics },
      timestamp: new Date(),
    };
  }

  @Post('unsubscribe')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  async unsubscribe(
    @Body() body: { fcmToken: string; topic: string },
    @Request() req: any,
  ) {
    await this.firebaseService.unsubscribeFromTopic(body.fcmToken, body.topic);
    return {
      success: true,
      timestamp: new Date(),
    };
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(
    @Request() req: any,
    @Query('read') read?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const query = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId: req.user.id });

    if (read !== undefined) {
      query.andWhere('n.isRead = :read', { read: read === 'true' });
    }

    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');

    const [notifications, total] = await query
      .orderBy('n.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount();

    return {
      success: true,
      data: notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      timestamp: new Date(),
    };
  }

  @Post(':id/mark-read')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Request() req: any, @Param('id') id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: parseInt(id), userId: req.user.id },
    });

    if (notification) {
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    }

    return {
      success: true,
      timestamp: new Date(),
    };
  }
}
