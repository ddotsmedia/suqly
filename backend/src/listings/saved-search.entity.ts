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
import { User } from '../users/user.entity';

export type EmailFrequency = 'daily' | 'weekly' | 'never';

@Entity('saved_searches')
@Index('idx_user_id_created', ['userId', 'createdAt'])
@Index('idx_user_email_alert', ['userId', 'emailAlert'])
export class SavedSearch {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  userId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'jsonb', default: {} })
  query: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  filters: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  emailAlert: boolean;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'never'],
    default: 'never',
  })
  frequency: EmailFrequency;

  @Column({ type: 'timestamp', nullable: true })
  lastAlertSent: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
