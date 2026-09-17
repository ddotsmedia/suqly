import { Injectable, BadRequestException } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio;
  private accountSid: string;
  private authToken: string;
  private twilioPhone: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhone = process.env.TWILIO_PHONE;
  }

  private getClient(): twilio.Twilio {
    if (!this.client) {
      this.client = twilio(this.accountSid, this.authToken);
    }
    return this.client;
  }

  private isEnabled(): boolean {
    return this.accountSid && this.accountSid.startsWith('AC') &&
           this.authToken && this.authToken.length > 0;
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    if (!this.isEnabled()) {
      console.log(`[SMS] OTP for ${phoneNumber}: ${otp}`);
      return;
    }

    try {
      await this.getClient().messages.create({
        body: `Your Suqly verification code is: ${otp}. Valid for 10 minutes.`,
        from: this.twilioPhone,
        to: phoneNumber,
      });
    } catch (error) {
      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    if (!this.isEnabled()) {
      console.log(`[SMS] To ${phoneNumber}: ${message}`);
      return;
    }

    try {
      await this.getClient().messages.create({
        body: message,
        from: this.twilioPhone,
        to: phoneNumber,
      });
    } catch (error) {
      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }
}
