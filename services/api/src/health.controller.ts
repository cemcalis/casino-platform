import { Controller, Get } from '@nestjs/common';
import { CurrentUser, Public } from '@casino/auth';
import type { JwtPayload } from '@casino/auth';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload): { userId: string; email: string; role: string } {
    return { userId: user.sub, email: user.email, role: user.role };
  }
}
