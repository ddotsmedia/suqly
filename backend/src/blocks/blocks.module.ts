import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksService } from './blocks.service';
import { Block } from './block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Block])],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
