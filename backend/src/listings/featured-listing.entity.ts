import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Listing } from './listing.entity';

export type FeaturedPriceTier = 'free' | 'premium';

@Entity('featured_listings')
@Index('idx_listing_id', ['listingId'], { unique: true })
@Index('idx_is_active_expires', ['isActive', 'expiresAt'])
@Index('idx_featured_by_admin', ['featuredByAdmin'])
export class FeaturedListing {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', unique: true })
  listingId: number;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @Column({ type: 'boolean', default: false })
  featuredByAdmin: boolean;

  @Column({ type: 'timestamp' })
  featuredAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: ['free', 'premium'],
    default: 'free',
  })
  priceTier: FeaturedPriceTier;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pricePaid: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  priceCurrency: string;

  @Column({ type: 'timestamp', nullable: true })
  lastPaymentDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
