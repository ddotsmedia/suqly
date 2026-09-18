import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { ImageCompressionService } from './image-compression.service';
import { ImageUploadService } from './image-upload.service';
import { CsvImportService } from './csv-import.service';
import { ImageProcessingService } from './image-processing.service';
import { BatchOperationsService } from './batch-operations.service';
import { GeocodingService } from './geocoding.service';
import { SavedSearchesService } from './saved-searches.service';
import { SavedSearchesController } from './saved-searches.controller';
import { WishlistService } from './wishlist.service';
import {
  WishlistController,
  WishlistListController,
  WishlistCheckController,
} from './wishlist.controller';
import { FeaturedListingsService } from './featured-listings.service';
import {
  FeaturedListingsController,
  FeaturedListingsAdminController,
  FeaturedListingsManagementController,
} from './featured-listings.controller';
import { Listing } from './listing.entity';
import { ListingImage } from './listing-image.entity';
import { SavedSearch } from './saved-search.entity';
import { WishlistItem, WishlistShare } from './wishlist.entity';
import { FeaturedListing } from './featured-listing.entity';
import { UsersModule } from '../users/users.module';
import { ModerationModule } from '../moderation/moderation.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SavedSearchesEmailProcessor } from '../jobs/saved-searches-email.processor';
import { FeaturedListingsExpiryProcessor } from '../jobs/featured-listings-expiry.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Listing,
      ListingImage,
      SavedSearch,
      WishlistItem,
      WishlistShare,
      FeaturedListing,
    ]),
    UsersModule,
    ModerationModule,
    NotificationsModule,
  ],
  controllers: [
    ListingsController,
    SavedSearchesController,
    WishlistController,
    WishlistListController,
    WishlistCheckController,
    FeaturedListingsController,
    FeaturedListingsAdminController,
    FeaturedListingsManagementController,
  ],
  providers: [
    ListingsService,
    ImageCompressionService,
    ImageUploadService,
    CsvImportService,
    ImageProcessingService,
    BatchOperationsService,
    SavedSearchesService,
    WishlistService,
    FeaturedListingsService,
    GeocodingService,
    SavedSearchesEmailProcessor,
    FeaturedListingsExpiryProcessor,
  ],
  exports: [
    ListingsService,
    ImageCompressionService,
    ImageUploadService,
    CsvImportService,
    ImageProcessingService,
    BatchOperationsService,
    SavedSearchesService,
    WishlistService,
    FeaturedListingsService,
    GeocodingService,
  ],
})
export class ListingsModule {}
