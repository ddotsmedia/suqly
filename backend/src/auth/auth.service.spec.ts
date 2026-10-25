import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { SmsService } from './sms.service';
import { User } from '../users/user.entity';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: 1 }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: SmsService,
          useValue: {
            sendOtp: jest.fn(),
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send OTP successfully', async () => {
    const result = await service.sendOTP('+971501234567');
    expect(result).toEqual({
      success: true,
      message: expect.any(String),
    });
  });

  it('should handle invalid phone format', async () => {
    const result = await service.sendOTP('invalid-phone');
    expect(result).toEqual({
      success: true,
      message: expect.any(String),
    });
  });

  describe('register', () => {
    const input = { name: 'Test User', email: 'test@example.com', phone: '+971509379212', password: 'secret-pass' };

    it('rejects an email or phone that is already registered', async () => {
      const repo = (service as any).usersRepository;
      repo.findOne.mockResolvedValue({ id: 5 });
      await expect(service.register(input)).rejects.toBeInstanceOf(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('stores a bcrypt hash, never the plain password', async () => {
      const repo = (service as any).usersRepository;
      repo.findOne.mockResolvedValue(null);
      repo.create.mockImplementation((d: any) => d);
      repo.save.mockImplementation(async (d: any) => ({ id: 9, ...d }));
      const result = await service.register(input);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.passwordHash).not.toBe(input.password);
      expect(saved.passwordHash).toMatch(/^\$2[aby]\$/);
      expect(saved.phoneVerified).toBe(false);
      expect(result.user).toEqual({ id: 9, email: input.email, phone: input.phone, displayName: input.name });
      expect(JSON.stringify(result)).not.toContain('passwordHash');
    });
  });
});
