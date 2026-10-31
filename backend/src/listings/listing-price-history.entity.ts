import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Listing } from './listing.entity';

@Entity('listing_price_history')
@Index('idx_price_history_listing', ['listingId'])
@Index('idx_price_history_date', ['changedAt'])
export class ListingPriceHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  listingId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @CreateDateColumn()
  changedAt: Date;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;
}
