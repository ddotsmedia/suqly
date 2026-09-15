import { Injectable, BadRequestException } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio;
  private twilioPhone: string;
  private enabled: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhone = process.env.TWILIO_PHONE;

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
      this.enabled = true;
    } else {
      this.enabled = false;
    }
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    if (!this.enabled) {
      console.log(`[SMS] OTP for ${phoneNumber}: ${otp}`);
      return;
    }

    try {
      await this.client.messages.create({
        body: `Your Suqly verification code is: ${otp}. Valid for 10 minutes.`,
        from: this.twilioPhone,
        to: phoneNumber,
      });
    } catch (error) {
      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    if (!this.enabled) {
      console.log(`[SMS] To ${phoneNumber}: ${message}`);
      return;
    }

    try {
      await this.client.messages.create({
        body: message,
        from: this.twilioPhone,
        to: phoneNumber,
      });
    } catch (error) {
      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }
}
