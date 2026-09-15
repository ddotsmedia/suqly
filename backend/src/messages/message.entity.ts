import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Listing } from '../listings/listing.entity';
import { User } from '../users/user.entity';

@Entity('messages')
@Index(['listingId', 'createdAt'], { synchronize: false })
@Index(['senderId', 'recipientId'])
export class Message {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  listingId: number;

  @Column({ type: 'bigint' })
  senderId: number;

  @Column({ type: 'bigint' })
  recipientId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Listing, (listing) => listing.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;
}
