import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type EventType = 'view' | 'click' | 'search' | 'contact' | 'wishlist' | 'message';

@Entity('analytics_events')
@Index('idx_listing_id', ['listingId'])
@Index('idx_user_id', ['userId'])
@Index('idx_event_type', ['eventType'])
@Index('idx_created_at', ['createdAt'])
@Index('idx_listing_event', ['listingId', 'eventType'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50 })
  eventType: EventType;

  @Column({ type: 'bigint', nullable: true })
  listingId: number;

  @Column({ type: 'bigint', nullable: true })
  userId: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
