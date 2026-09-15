import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { MessagesModule } from './messages/messages.module';
import { ModerationModule } from './moderation/moderation.module';

import { databaseConfig } from './config/database.config';

import { User } from './users/user.entity';
import { Listing } from './listings/listing.entity';
import { ListingImage } from './listings/listing-image.entity';
import { Message } from './messages/message.entity';
import { Review } from './reviews/review.entity';
import { ModerationQueue } from './moderation/moderation-queue.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([
      User,
      Listing,
      ListingImage,
      Message,
      Review,
      ModerationQueue,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'suqly-super-secret-key-dev-only',
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    MessagesModule,
    ModerationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
