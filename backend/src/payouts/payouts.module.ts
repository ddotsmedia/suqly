import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeConnectService } from './stripe-connect.service';
import { PayoutsController } from './payouts.controller';
import { Payout, StripeConnectAccount } from './payout.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payout, StripeConnectAccount])],
  controllers: [PayoutsController],
  providers: [StripeConnectService],
  exports: [StripeConnectService],
})
export class PayoutsModule {}
