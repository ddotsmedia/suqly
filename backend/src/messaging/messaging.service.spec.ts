import { Test, TestingModule } from '@nestjs/testing';
import { MessagingService } from './messaging.service';

describe('MessagingService', () => {
  let service: MessagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagingService],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate WhatsApp link', () => {
    const link = service.generateWhatsAppLink('+971501234567', 'Hello');
    expect(link).toContain('https://wa.me/971501234567');
    expect(link).toContain('text=Hello');
  });

  it('should encode special characters in WhatsApp link', () => {
    const message = 'Hi, interested in iPhone 12?';
    const link = service.generateWhatsAppLink('+971501234567', message);
    expect(link).toContain('Hi%2C');
    expect(link).toContain('interested');
  });

  it('should generate Telegram link', () => {
    const link = service.generateTelegramLink('username', 'Hello');
    expect(link).toContain('https://t.me/username');
    expect(link).toContain('start=Hello');
  });

  it('should generate Telegram link with @ prefix', () => {
    const link = service.generateTelegramLink('username', 'Hello');
    expect(link).not.toContain('@@');
  });

  it('should generate prefilled message', () => {
    const messages = service.getPrefilledMessage('iPhone 12', 5000, 'John');
    expect(messages.whatsapp).toContain('iPhone 12');
    expect(messages.whatsapp).toContain('5000');
    expect(messages.whatsapp).toContain('John');
    expect(messages.telegram).toEqual(messages.whatsapp);
  });

  it('should validate E.164 phone numbers', () => {
    expect(service.validatePhoneNumber('+971501234567')).toBe(true);
    expect(service.validatePhoneNumber('971501234567')).toBe(true);
    expect(service.validatePhoneNumber('+1234567890')).toBe(true);
    expect(service.validatePhoneNumber('invalid')).toBe(false);
    expect(service.validatePhoneNumber('+0123456789')).toBe(false);
  });

  it('should validate Telegram username', () => {
    expect(service.validateTelegramUsername('username')).toBe(true);
    expect(service.validateTelegramUsername('@username')).toBe(true);
    expect(service.validateTelegramUsername('user_name_123')).toBe(true);
    expect(service.validateTelegramUsername('user')).toBe(false);
    expect(service.validateTelegramUsername('user@name')).toBe(false);
    expect(service.validateTelegramUsername('user name')).toBe(false);
  });

  it('should mask phone numbers', () => {
    const masked = service.maskPhoneNumber('+971501234567');
    expect(masked).toContain('X');
    expect(masked).toContain('7');
    expect(masked).not.toContain('5');
  });

  it('should handle phone masking with different formats', () => {
    const masked1 = service.maskPhoneNumber('+971 50 123 4567');
    const masked2 = service.maskPhoneNumber('971501234567');
    expect(masked1).toContain('X');
    expect(masked2).toContain('X');
  });
});
