import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { FirebaseService } from './firebase.service';
import { NotificationsController } from './push.controller';
import { PushSubscription } from './push-subscription.entity';
import { Notification } from './notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PushSubscription, Notification])],
  controllers: [NotificationsController],
  providers: [EmailService, FirebaseService],
  exports: [EmailService, FirebaseService],
})
export class NotificationsModule {}
