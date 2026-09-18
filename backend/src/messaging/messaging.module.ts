import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import {
  MessagingController,
  ListingContactController,
  UserContactController,
} from './messaging.controller';

@Module({
  controllers: [MessagingController, ListingContactController, UserContactController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
