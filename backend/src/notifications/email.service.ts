import { Injectable, BadRequestException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private initialized = false;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@suqly.com';
  }

  private ensureInitialized(): boolean {
    if (!this.apiKey || !this.apiKey.startsWith('SG')) {
      return false;
    }

    if (!this.initialized) {
      try {
        sgMail.setApiKey(this.apiKey);
        this.initialized = true;
      } catch (error) {
        console.warn('[Email] Failed to initialize SendGrid:', error.message);
        return false;
      }
    }

    return true;
  }

  async sendWelcome(email: string, displayName: string): Promise<void> {
    if (!this.ensureInitialized()) {
      console.log(`[EMAIL] Welcome email to ${email}`);
      return;
    }

    try {
      await sgMail.send({
        to: email,
        from: this.fromEmail,
        subject: 'Welcome to Suqly Marketplace',
        html: `<p>Welcome ${displayName}!</p><p>Start listing or browsing local items now.</p>`,
      });
    } catch (error) {
      console.error('SendGrid error:', error);
    }
  }

  async sendListingPublished(email: string, listingTitle: string, listingUrl: string): Promise<void> {
    if (!this.ensureInitialized()) {
      console.log(`[EMAIL] Listing published to ${email}: ${listingTitle}`);
      return;
    }

    try {
      await sgMail.send({
        to: email,
        from: this.fromEmail,
        subject: `Your listing "${listingTitle}" is now live`,
        html: `<p>Your listing is now visible to buyers.</p><p><a href="${listingUrl}">View listing</a></p>`,
      });
    } catch (error) {
      console.error('SendGrid error:', error);
    }
  }

  async sendMessageNotification(email: string, senderName: string, messagePreview: string): Promise<void> {
    if (!this.ensureInitialized()) {
      console.log(`[EMAIL] Message from ${senderName} to ${email}`);
      return;
    }

    try {
      await sgMail.send({
        to: email,
        from: this.fromEmail,
        subject: `New message from ${senderName}`,
        html: `<p><strong>${senderName}</strong> sent you a message:</p><p>"${messagePreview}"</p>`,
      });
    } catch (error) {
      console.error('SendGrid error:', error);
    }
  }

  async sendModerationAlert(email: string, listingTitle: string, reason: string): Promise<void> {
    if (!this.ensureInitialized()) {
      console.log(`[EMAIL] Moderation alert to ${email}: ${reason}`);
      return;
    }

    try {
      await sgMail.send({
        to: email,
        from: this.fromEmail,
        subject: `Your listing "${listingTitle}" needs review`,
        html: `<p>Your listing was flagged for: <strong>${reason}</strong></p><p>Our team will review it shortly.</p>`,
      });
    } catch (error) {
      console.error('SendGrid error:', error);
    }
  }
}
