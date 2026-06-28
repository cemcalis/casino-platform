import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from './database';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
