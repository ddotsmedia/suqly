import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('subscription_tiers')
export class SubscriptionTier {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  tierName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerMonth: number;

  @Column({ type: 'jsonb' })
  features: any;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('seller_subscriptions')
@Index('idx_seller_subscriptions_seller', ['sellerId'])
export class SellerSubscription {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', unique: true })
  sellerId: number;

  @Column({ type: 'bigint', nullable: true })
  tierId: number;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodEnd: Date;

  @Column({ type: 'boolean', default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @ManyToOne(() => SubscriptionTier)
  @JoinColumn({ name: 'tierId' })
  tier: SubscriptionTier;
}

@Entity('saved_searches')
@Index('idx_saved_searches_user', ['userId'])
export class SavedSearch {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  query: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: any;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  lastUsedAt: Date;
}

@Entity('audit_logs')
@Index('idx_audit_logs_timestamp', ['timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', nullable: true })
  userId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  action: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tableName: string;

  @Column({ type: 'bigint', nullable: true })
  recordId: number;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: any;

  @Column({ type: 'jsonb', nullable: true })
  newValues: any;

  @CreateDateColumn()
  timestamp: Date;
}
