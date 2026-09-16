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

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'moderator', 'buyer', 'seller', 'merchant', 'staff'],
    default: 'buyer',
  })
  role: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  idVerified: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  displayName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 5, default: 'en' })
  language: string;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
  sellerScore: number;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
  responseRate: number;

  @Column({ type: 'boolean', default: false })
  termsAccepted: boolean;

  @Column({ type: 'boolean', default: false })
  privacyAccepted: boolean;

  @Column({ type: 'text', nullable: true })
  sellerBio: string;

  @Column({ type: 'integer', nullable: true })
  avgResponseTimeMinutes: number;

  @Column({ type: 'varchar', length: 20, default: 'free' })
  premiumTier: string;

  @Column({ type: 'boolean', default: false })
  profileVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  featuredUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Listing, (listing) => listing.user)
  listings: Listing[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.recipient)
  receivedMessages: Message[];
}
