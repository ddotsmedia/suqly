import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class MessagingService {
  generateWhatsAppLink(phoneNumber: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  generateTelegramLink(telegramUsername: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://t.me/${telegramUsername}?start=${encodedMessage}`;
  }

  getPrefilledMessage(listingTitle: string, price: number, buyerName: string = 'there'): {
    whatsapp: string;
    telegram: string;
  } {
    const baseMessage = `Hi ${buyerName}, I'm interested in your ${listingTitle} listed on Suqly. Listed price: ${price} AED. Can we discuss?`;
    return {
      whatsapp: baseMessage,
      telegram: baseMessage,
    };
  }

  validatePhoneNumber(phone: string): boolean {
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    return e164Regex.test(phone.replace(/\s/g, ''));
  }

  validateTelegramUsername(username: string): boolean {
    const telegramRegex = /^[a-zA-Z0-9_]{5,32}$/;
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
    return telegramRegex.test(cleanUsername);
  }

  maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    const cleaned = phone.replace(/\D/g, '');
    const lastDigit = cleaned.slice(-1);
    const countryCode = cleaned.slice(0, -10);
    return `${countryCode}XXXXXXX${lastDigit}`;
  }
}
