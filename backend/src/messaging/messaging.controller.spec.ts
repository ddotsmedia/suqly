import { Test, TestingModule } from '@nestjs/testing';
import {
  MessagingController,
  ListingContactController,
  UserContactController,
} from './messaging.controller';
import { MessagingService } from './messaging.service';
import { BadRequestException } from '@nestjs/common';

describe('MessagingController', () => {
  let controller: MessagingController;
  const mockService = {
    generateWhatsAppLink: jest.fn(),
    generateTelegramLink: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
      providers: [
        {
          provide: MessagingService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MessagingController>(MessagingController);
  });

  it('should generate contact link', async () => {
    const result = await controller.generateContactLink({
      listingId: 1,
      contactMethod: 'whatsapp',
    });

    expect(result.method).toBe('whatsapp');
    expect(result.url).toBeDefined();
  });

  it('should throw error on missing listingId', async () => {
    await expect(
      controller.generateContactLink({
        listingId: 0,
        contactMethod: 'whatsapp',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('ListingContactController', () => {
  let controller: ListingContactController;
  const mockService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingContactController],
      providers: [
        {
          provide: MessagingService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ListingContactController>(ListingContactController);
  });

  it('should get contact methods', async () => {
    const result = await controller.getContactMethods(1);

    expect(result.whatsappEnabled).toBeDefined();
    expect(result.telegramEnabled).toBeDefined();
  });
});

describe('UserContactController', () => {
  let controller: UserContactController;
  const mockService = {
    validatePhoneNumber: jest.fn().mockReturnValue(true),
    validateTelegramUsername: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserContactController],
      providers: [
        {
          provide: MessagingService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserContactController>(UserContactController);
  });

  it('should update contact info', async () => {
    const req = { user: { id: 1 } };
    const result = await controller.updateContactInfo(req, 1, {
      phoneNumber: '+971501234567',
    });

    expect(result.success).toBe(true);
  });

  it('should throw on invalid phone', async () => {
    const req = { user: { id: 1 } };
    mockService.validatePhoneNumber.mockReturnValueOnce(false);

    await expect(
      controller.updateContactInfo(req, 1, {
        phoneNumber: 'invalid',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should get public contact info', async () => {
    const result = await controller.getPublicContactInfo(1);

    expect(result.whatsappEnabled).toBeDefined();
    expect(result.maskedPhone).toBeDefined();
  });
});
