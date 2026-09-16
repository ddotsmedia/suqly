import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { SmsService } from './sms.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

const otpStore = new Map<string, { code: string; expires: number }>();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private smsService: SmsService,
  ) {}

  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore.set(phone, {
      code: otp,
      expires: Date.now() + 600000,
    });

    await this.smsService.sendOtp(phone, otp);

    return { success: true, message: `OTP sent to ${phone}` };
  }

  async verifyOTP(
    phone: string,
    code: string,
  ): Promise<{ token: string; user: Partial<User> }> {
    const otpData = otpStore.get(phone);

    if (!otpData || otpData.expires < Date.now()) {
      throw new UnauthorizedException('OTP expired');
    }

    if (otpData.code !== code) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Delete OTP after successful verification
    otpStore.delete(phone);

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

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async logout(token: string): Promise<{ success: boolean }> {
    // In-memory session cleanup would happen here
    // For S01, we just validate token and return success
    return { success: true };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async adminLogin(
    username: string,
    password: string,
  ): Promise<{ token: string; user: Partial<User> }> {
    try {
      console.log('[adminLogin] Attempting login for:', username);

      const user = await this.usersRepository.findOne({
        where: [{ email: username }, { username }],
      });

      console.log('[adminLogin] User found:', user?.email, 'Role:', user?.role);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.role !== 'admin' && user.role !== 'moderator') {
        console.log('[adminLogin] Access denied - role is:', user.role);
        throw new UnauthorizedException('Access denied - admin only');
      }

      console.log('[adminLogin] Comparing passwords...');
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      console.log('[adminLogin] Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });

      console.log('[adminLogin] Login successful for:', user.email);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          displayName: user.displayName,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('[adminLogin] Error:', error.message || error);
      throw error;
    }
  }
}
