import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SellersController } from './sellers.controller';
import { SellerStatsService } from './seller-stats.service';
import { BlocksService } from '../blocks/blocks.service';
import { User } from './user.entity';
import { Listing } from '../listings/listing.entity';
import { Review } from '../reviews/review.entity';
import { Message } from '../messages/message.entity';
import { Block } from '../blocks/block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Listing, Review, Message, Block])],
  controllers: [UsersController, SellersController],
  providers: [UsersService, SellerStatsService, BlocksService],
  exports: [UsersService, SellerStatsService, BlocksService],
})
export class UsersModule {}
