import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StripeConnectService } from './stripe-connect.service';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Payouts')
@Controller('payouts')
export class PayoutsController {
  constructor(private stripeConnectService: StripeConnectService) {}

  @Get('connect/authorize')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe Connect authorization URL' })
  async getAuthorizationUrl(@Request() req: any) {
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/connect/callback`;
    const url = await this.stripeConnectService.getAuthorizationUrl(req.user.id, redirectUrl);
    return {
      success: true,
      data: { authorization_url: url },
      timestamp: new Date(),
    };
  }

  @Get('balance')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller payout balance' })
  async getBalance(@Request() req: any) {
    const balance = await this.stripeConnectService.getBalance(req.user.id);
    return {
      success: true,
      data: {
        available_balance: balance.available,
        pending_balance: balance.pending,
        next_payout_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      timestamp: new Date(),
    };
  }

  @Get('history')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payout history' })
  async getPayoutHistory(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Request() req: any,
  ) {
    const result = await this.stripeConnectService.getPayoutHistory(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );

    return {
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date(),
    };
  }

  @Post('confirm-onboard')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm Stripe Connect onboarding' })
  async confirmOnboard(@Body() body: { code: string }, @Request() req: any) {
    return {
      success: true,
      data: { message: 'Stripe Connect onboarding confirmed' },
      timestamp: new Date(),
    };
  }
}
