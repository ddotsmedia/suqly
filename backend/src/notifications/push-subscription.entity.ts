import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('push_subscriptions')
@Unique(['userId', 'fcmToken'])
@Index('idx_push_subscriptions_user', ['userId'])
export class PushSubscription {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'varchar', length: 500 })
  fcmToken: string;

  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  topics: string[];

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
