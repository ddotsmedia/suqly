import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Listing } from '../listings/listing.entity';
import { Message } from '../messages/message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'moderator', 'buyer', 'seller', 'merchant', 'staff'],
    default: 'buyer',
  })
  role: string;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false, name: 'phone_verified' })
  phoneVerified: boolean;

  @Column({ type: 'boolean', default: false, name: 'id_verified' })
  idVerified: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'display_name' })
  displayName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 5, default: 'en' })
  language: string;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true, name: 'seller_score' })
  sellerScore: number;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true, name: 'response_rate' })
  responseRate: number;

  @Column({ type: 'boolean', default: false, name: 'terms_accepted' })
  termsAccepted: boolean;

  @Column({ type: 'boolean', default: false, name: 'privacy_accepted' })
  privacyAccepted: boolean;

  @Column({ type: 'text', nullable: true, name: 'seller_bio' })
  sellerBio: string;

  @Column({ type: 'integer', nullable: true, name: 'avg_response_time_minutes' })
  avgResponseTimeMinutes: number;

  @Column({ type: 'varchar', length: 20, default: 'free', name: 'premium_tier' })
  premiumTier: string;

  @Column({ type: 'boolean', default: false, name: 'profile_verified' })
  profileVerified: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'featured_until' })
  featuredUntil: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Listing, (listing) => listing.user)
  listings: Listing[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.recipient)
  receivedMessages: Message[];
}
