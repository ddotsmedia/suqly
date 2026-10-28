import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './block.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blocksRepo: Repository<Block>,
  ) {}

  async block(blockingUserId: number, blockedUserId: number): Promise<Block> {
    if (blockingUserId === blockedUserId) {
      throw new BadRequestException('Cannot block yourself');
    }
    const block = this.blocksRepo.create({
      blockingUserId,
      blockedUserId,
    });
    return this.blocksRepo.save(block);
  }

  async unblock(blockingUserId: number, blockedUserId: number): Promise<void> {
    await this.blocksRepo.delete({
      blockingUserId,
      blockedUserId,
    });
  }

  async isBlocked(blockingUserId: number, blockedUserId: number): Promise<boolean> {
    const block = await this.blocksRepo.findOne({
      where: { blockingUserId, blockedUserId },
    });
    return !!block;
  }
}
