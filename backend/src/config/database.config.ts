import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { ListingImage } from '../listings/listing-image.entity';
import { Message } from '../messages/message.entity';
import { Review } from '../reviews/review.entity';
import { ModerationQueue } from '../moderation/moderation-queue.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'suqly_dev',
  entities: [
    User,
    Listing,
    ListingImage,
    Message,
    Review,
    ModerationQueue,
  ],
  migrations: ['src/database/migrations/*.ts'],
  migrationsRun: process.env.DB_RUN_MIGRATIONS === 'true',
  synchronize: process.env.DB_SYNC === 'true' || process.env.NODE_ENV === 'development',
  logging: process.env.DB_LOGGING === 'true',
  maxQueryExecutionTime: 5000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  retryAttempts: 0,
};
