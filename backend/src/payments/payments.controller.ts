import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, RawBodyRequest, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { JwtGuard } from '../auth/jwt.guard';
import Stripe from 'stripe';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create checkout session' })
  async createCheckout(
    @Body() body: { listingId: number; amount: number },
    @Request() req: any,
  ) {
    const { clientSecret, sessionId } = await this.stripeService.createCheckoutSession(
      req.user.id,
      body.listingId,
      body.amount,
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
    );

    return {
      success: true,
      data: { clientSecret, sessionId },
      timestamp: new Date(),
    };
  }

  @Post('confirm')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment completion' })
  async confirmPayment(@Body() body: { sessionId: string }) {
    const transaction = await this.stripeService.confirmPayment(body.sessionId);
    return {
      success: true,
      data: transaction,
      timestamp: new Date(),
    };
  }

  @Get('transactions')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user transactions' })
  async getTransactions(
    @Query('type') type: 'bought' | 'sold' = 'bought',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Request() req: any,
  ) {
    const result = await this.stripeService.getTransactions(
      req.user.id,
      type,
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

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook' })
  async handleWebhook(@Req() req: RawBodyRequest<any>) {
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !secret) {
      throw new BadRequestException('Webhook signature missing');
    }

    let event: Stripe.Event;
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(req.rawBody, sig as string, secret);
    } catch (err) {
      throw new BadRequestException(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.stripeService.confirmPayment(session.id);
    }

    return { received: true };
  }
}
