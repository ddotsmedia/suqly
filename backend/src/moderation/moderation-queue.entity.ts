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

@Entity('moderation_queue')
@Index('idx_moderation_status', ['status'])
@Index('idx_moderation_flagged_at', ['flaggedAt'])
export class ModerationQueue {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  listingId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reason: string;

  @Column({ type: 'bigint', nullable: true })
  flaggedByUserId: number;

  @CreateDateColumn()
  flaggedAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'bigint', nullable: true })
  reviewerId: number;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'appeal_status' })
  appealStatus: string;

  @Column({ type: 'text', nullable: true, name: 'appeal_reason' })
  appealReason: string;

  @Column({ type: 'timestamp', nullable: true, name: 'appeal_at' })
  appealAt: Date;

  @Column({ type: 'text', nullable: true, name: 'appeal_decision_note' })
  appealDecisionNote: string;

  @Column({ type: 'timestamp', nullable: true, name: 'appeal_decided_at' })
  appealDecidedAt: Date;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'flaggedByUserId' })
  flaggedByUser: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;
}
