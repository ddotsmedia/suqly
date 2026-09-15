import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Listing } from './listing.entity';

@Entity('listing_images')
export class ListingImage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  listingId: number;

  @Column({ type: 'varchar', length: 255 })
  thumbnailUrl: string;

  @Column({ type: 'varchar', length: 255 })
  fullUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalFilename: string;

  @Column({ type: 'integer', nullable: true })
  compressedSizeBytes: number;

  @Column({ type: 'boolean', default: false })
  hasDefects: boolean;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => Listing, (listing) => listing.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;
}
