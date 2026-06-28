import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@casino/auth';
import type { JwtPayload } from '@casino/auth';

@Controller('health')
export class HealthController {
  @Get()
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload): { userId: string; email: string; role: string } {
    return { userId: user.sub, email: user.email, role: user.role };
  }
}
