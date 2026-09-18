import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './analytics-events.entity';
import { SeoService } from '../seo/seo.service';
import { SeoAuditService } from '../seo/seo-audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEvent])],
  providers: [AnalyticsService, SeoService, SeoAuditService],
  exports: [AnalyticsService, SeoService, SeoAuditService],
})
export class AnalyticsModule {}
