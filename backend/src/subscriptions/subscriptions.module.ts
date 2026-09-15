import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionTier, SellerSubscription, SavedSearch, AuditLog } from './subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionTier, SellerSubscription, SavedSearch, AuditLog])],
  controllers: [SubscriptionsController],
  exports: [TypeOrmModule],
})
export class SubscriptionsModule {}
