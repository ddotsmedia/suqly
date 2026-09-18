import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { MessagingService } from './messaging.service';

@Controller('messaging')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Post('contact-link')
  async generateContactLink(
    @Body() body: { listingId: number; contactMethod: 'whatsapp' | 'telegram'; buyerName?: string },
  ): Promise<{ url: string; message: string; method: string }> {
    if (!body.listingId || !body.contactMethod) {
      throw new BadRequestException('listingId and contactMethod are required');
    }

    return {
      url: '#',
      message: 'Contact link generation requires seller contact info',
      method: body.contactMethod,
    };
  }
}

@Controller('listings')
export class ListingContactController {
  constructor(private messagingService: MessagingService) {}

  @Get(':id/contact-methods')
  async getContactMethods(
    @Param('id', new ParseIntPipe()) listingId: number,
  ): Promise<{
    whatsappEnabled: boolean;
    telegramEnabled: boolean;
    whatsappLink?: string;
    telegramLink?: string;
    maskedPhone?: string;
  }> {
    return {
      whatsappEnabled: true,
      telegramEnabled: false,
      maskedPhone: '+971XXXXXXX7',
    };
  }
}

@Controller('users')
export class UserContactController {
  constructor(private messagingService: MessagingService) {}

  @Post(':id/contact-info')
  @UseGuards(JwtGuard)
  async updateContactInfo(
    @Request() req,
    @Param('id', new ParseIntPipe()) userId: number,
    @Body() body: { phoneNumber?: string; telegramUsername?: string },
  ): Promise<{ success: boolean }> {
    if (req.user.id !== userId) {
      throw new BadRequestException('Cannot update other users contact info');
    }

    if (body.phoneNumber && !this.messagingService.validatePhoneNumber(body.phoneNumber)) {
      throw new BadRequestException('Invalid phone number format');
    }

    if (body.telegramUsername && !this.messagingService.validateTelegramUsername(body.telegramUsername)) {
      throw new BadRequestException('Invalid Telegram username format');
    }

    return { success: true };
  }

  @Get(':id/contact-info')
  async getPublicContactInfo(
    @Param('id', new ParseIntPipe()) userId: number,
  ): Promise<{ whatsappEnabled: boolean; telegramEnabled: boolean; maskedPhone?: string }> {
    return {
      whatsappEnabled: true,
      telegramEnabled: false,
      maskedPhone: '+971XXXXXXX7',
    };
  }
}
