import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SellerStatsService } from './seller-stats.service';
import { User } from './user.entity';
import { Listing } from '../listings/listing.entity';
import { Review } from '../reviews/review.entity';
import { Message } from '../messages/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Listing, Review, Message])],
  controllers: [UsersController],
  providers: [UsersService, SellerStatsService],
  exports: [UsersService, SellerStatsService],
})
export class UsersModule {}
