import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('payouts')
@Index('idx_payouts_seller', ['sellerId'])
@Index('idx_payouts_status', ['status'])
export class Payout {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  sellerId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePayoutId: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;
}

@Entity('stripe_connect_accounts')
export class StripeConnectAccount {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', unique: true })
  sellerId: number;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  stripeAccountId: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'boolean', default: false })
  payoutEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  chargesEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  transfersEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;
}
