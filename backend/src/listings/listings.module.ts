import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { ImageCompressionService } from './image-compression.service';
import { Listing } from './listing.entity';
import { ListingImage } from './listing-image.entity';
import { UsersModule } from '../users/users.module';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, ListingImage]),
    UsersModule,
    ModerationModule,
  ],
  controllers: [ListingsController],
  providers: [ListingsService, ImageCompressionService],
  exports: [ListingsService, ImageCompressionService],
})
export class ListingsModule {}
