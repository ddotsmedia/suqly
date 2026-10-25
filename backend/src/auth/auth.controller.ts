import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Send OTP to phone' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async login(@Body() body: { phone: string }) {
    if (!body.phone || !/^\+?[0-9]{7,15}$/.test(body.phone.replace(/\D/g, ''))) {
      throw new BadRequestException('Invalid phone number');
    }

    return this.authService.sendOTP(body.phone);
  }

  @Post('register')
  @ApiOperation({ summary: 'Create an account with email, phone and password' })
  @ApiResponse({ status: 201, description: 'Account created; sign in with phone OTP to verify the phone' })
  @ApiResponse({ status: 409, description: 'Email or phone already registered' })
  async register(
    @Body()
    body: { name: string; email: string; phone: string; password: string; termsAccepted?: boolean },
  ) {
    const name = (body.name ?? '').trim();
    const email = (body.email ?? '').trim().toLowerCase();
    const phone = (body.phone ?? '').trim();

    if (!name || name.length > 100) {
      throw new BadRequestException('Name is required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
      throw new BadRequestException('A valid email is required');
    }
    if (!/^\+?[0-9]{7,15}$/.test(phone.replace(/\D/g, ''))) {
      throw new BadRequestException('Invalid phone number');
    }
    if (!body.password || body.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    if (body.termsAccepted !== true) {
      throw new BadRequestException('You must accept the terms');
    }

    return this.authService.register({
      name,
      email,
      phone,
      password: body.password,
    });
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get JWT token' })
  @ApiResponse({ status: 200, description: 'Token issued successfully' })
  async verifyOtp(@Body() body: { phone: string; code: string }) {
    if (!body.phone || !body.code) {
      throw new BadRequestException('Phone and code are required');
    }

    if (!/^\d{6}$/.test(body.code)) {
      throw new BadRequestException('Code must be 6 digits');
    }

    return this.authService.verifyOTP(body.phone, body.code);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new BadRequestException('Token required');
    }

    return this.authService.logout(token);
  }

  @Post('login-admin')
  @ApiOperation({ summary: 'Admin login with username and password' })
  @ApiResponse({ status: 200, description: 'Admin token issued successfully' })
  async loginAdmin(@Body() body: { username: string; password: string }) {
    if (!body.username || !body.password) {
      throw new BadRequestException('Username and password are required');
    }

    return this.authService.adminLogin(body.username, body.password);
  }
}
