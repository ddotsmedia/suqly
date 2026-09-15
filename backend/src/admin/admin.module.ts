import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { Transaction } from '../payments/transaction.entity';
import { ModerationQueue } from '../moderation/moderation-queue.entity';
import { ModerationService } from '../moderation/moderation.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Listing, Transaction, ModerationQueue])],
  controllers: [AdminController],
  providers: [AdminService, ModerationService],
})
export class AdminModule {}
