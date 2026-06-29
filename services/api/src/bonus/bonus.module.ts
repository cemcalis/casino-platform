import { Module } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { BonusController } from './bonus.controller';
import { PrismaModule } from '../database';

@Module({
  imports: [PrismaModule],
  providers: [BonusService],
  controllers: [BonusController],
})
export class BonusModule {}
