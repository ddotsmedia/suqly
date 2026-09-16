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
