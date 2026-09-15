import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ListingImage } from './listing-image.entity';
import { Message } from '../messages/message.entity';

@Entity('listings')
@Index('idx_user_id', ['userId'])
@Index('idx_category_emirate', ['category', 'emirate'])
@Index('idx_status', ['status'])
@Index('idx_published_at', ['publishedAt'])
export class Listing {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ['goods', 'property', 'motors', 'jobs', 'services', 'businesses'],
  })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subcategory: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: [
      'dubai',
      'abudhabi',
      'sharjah',
      'ajman',
      'umm_al_quwain',
      'ras_al_khaimah',
      'fujairah',
      'al_ain',
    ],
  })
  emirate: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  community: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publicLocation: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'pending_review', 'active', 'on_hold', 'sold', 'expired'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastConfirmedAt: Date;

  @Column({ type: 'integer', nullable: true })
  daysSinceConfirmed: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  slug: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.listings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ListingImage, (image) => image.listing, { eager: true })
  images: ListingImage[];

  @OneToMany(() => Message, (message) => message.listing)
  messages: Message[];
}
