import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('blocks')
@Index('idx_blocks_pair', ['blockingUserId', 'blockedUserId'], { unique: true })
export class Block {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', name: 'blocking_user_id' })
  blockingUserId: number;

  @Column({ type: 'bigint', name: 'blocked_user_id' })
  blockedUserId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
