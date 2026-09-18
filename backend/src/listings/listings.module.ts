import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { ImageCompressionService } from './image-compression.service';
import { SavedSearchesService } from './saved-searches.service';
import { SavedSearchesController } from './saved-searches.controller';
import { Listing } from './listing.entity';
import { ListingImage } from './listing-image.entity';
import { SavedSearch } from './saved-search.entity';
import { UsersModule } from '../users/users.module';
import { ModerationModule } from '../moderation/moderation.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SavedSearchesEmailProcessor } from '../jobs/saved-searches-email.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Listing, ListingImage, SavedSearch]),
    UsersModule,
    ModerationModule,
    NotificationsModule,
  ],
  controllers: [ListingsController, SavedSearchesController],
  providers: [
    ListingsService,
    ImageCompressionService,
    SavedSearchesService,
    SavedSearchesEmailProcessor,
  ],
  exports: [ListingsService, ImageCompressionService, SavedSearchesService],
})
export class ListingsModule {}
