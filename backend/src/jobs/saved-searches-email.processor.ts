import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SavedSearchesService } from '../listings/saved-searches.service';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class SavedSearchesEmailProcessor {
  private readonly logger = new Logger(SavedSearchesEmailProcessor.name);

  constructor(
    private savedSearchesService: SavedSearchesService,
    private emailService: EmailService,
  ) {}

  @Cron('0 2 * * *')
  async processDailyEmailAlerts(): Promise<void> {
    try {
      this.logger.log('Starting saved searches email alert job');
      const searches = await this.savedSearchesService.findDueForEmailAlert();
      this.logger.log(`Found ${searches.length} searches due for email alerts`);

      for (const search of searches) {
        try {
          const results = await this.savedSearchesService.searchListings(
            search.query,
            search.filters,
          );

          if (results && results.length > 0) {
            const preview = results.slice(0, 5);
            const subject = `${results.length} new listings match "${search.name}"`;

            await this.emailService.sendSavedSearchAlert(
              search.user.email,
              search.name,
              results.length,
              preview,
            );

            await this.savedSearchesService.markAlertSent(search.id);
            this.logger.log(
              `Email sent for saved search ${search.id} to ${search.user.email}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error processing saved search ${search.id}: ${error.message}`,
          );
        }
      }

      this.logger.log('Completed saved searches email alert job');
    } catch (error) {
      this.logger.error(`Job error: ${error.message}`);
    }
  }
}
