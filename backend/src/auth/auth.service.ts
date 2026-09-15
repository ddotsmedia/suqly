import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as crypto from 'crypto';
import * as redis from 'redis';

@Injectable()
export class AuthService {
  private redisClient: redis.RedisClient;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    this.redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    this.redisClient.on('error', (err) => console.error('Redis error:', err));
  }

  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store in Redis with 10-minute expiry
    const otpKey = `otp:${phone}`;
    this.redisClient.setex(otpKey, 600, otp);

    console.log(`📱 OTP for ${phone}: ${otp} (dev mode - not sent via Twilio)`);

    return { success: true, message: `OTP sent to ${phone}` };
  }

  async verifyOTP(
    phone: string,
    code: string,
  ): Promise<{ token: string; user: Partial<User> }> {
    return new Promise((resolve, reject) => {
      const otpKey = `otp:${phone}`;

      this.redisClient.get(otpKey, async (err, storedOtp) => {
        if (err) {
          return reject(new UnauthorizedException('OTP verification failed'));
        }

        if (!storedOtp || storedOtp !== code) {
          return reject(new UnauthorizedException('Invalid OTP'));
        }

        // Delete OTP after successful verification
        this.redisClient.del(otpKey);

        // Find or create user
        let user = await this.usersRepository.findOne({ where: { phone } });

        if (!user) {
          user = this.usersRepository.create({
            phone,
            email: `${phone}@suqly.local`,
            username: `user_${phone.replace(/\D/g, '')}`,
            passwordHash: 'otp-auth',
            phoneVerified: true,
            role: 'buyer',
          });
          user = await this.usersRepository.save(user);
        } else {
          user.phoneVerified = true;
          user = await this.usersRepository.save(user);
        }

        // Generate JWT token
        const token = this.jwtService.sign({
          sub: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
        });

        // Store session in Redis
        const sessionKey = `session:${token}`;
        this.redisClient.setex(sessionKey, 86400, JSON.stringify(user));

        resolve({
          token,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            displayName: user.displayName,
            role: user.role,
          },
        });
      });
    });
  }

  async logout(token: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      const sessionKey = `session:${token}`;
      this.redisClient.del(sessionKey, (err) => {
        if (err) {
          console.error('Logout error:', err);
        }
        resolve({ success: true });
      });
    });
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
