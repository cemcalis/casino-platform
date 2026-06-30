import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, Roles, type JwtPayload } from '@casino/auth';
import { BonusService } from './bonus.service';

@Controller('bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Get('status')
  getBonusStatus(@CurrentUser() user: JwtPayload) {
    return this.bonusService.getBonusStatus(user.sub);
  }

  @Post('welcome')
  claimWelcome(@CurrentUser() user: JwtPayload) {
    return this.bonusService.claimWelcome(user.sub);
  }

  @Post('daily')
  claimDaily(@CurrentUser() user: JwtPayload) {
    return this.bonusService.claimDailyBonus(user.sub);
  }

  @Post('cashback')
  claimCashback(@CurrentUser() user: JwtPayload) {
    return this.bonusService.claimCashback(user.sub);
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────

  @Get('admin/config')
  @Roles('ADMIN')
  getAdminConfig() {
    return this.bonusService.getAdminConfig();
  }

  @Patch('admin/config/:type')
  @Roles('ADMIN')
  updateAdminConfig(
    @Param('type') type: 'WELCOME' | 'DAILY' | 'CASHBACK',
    @Body() body: { enabled?: boolean; baseAmount?: number; cashbackPct?: number; expiresInDays?: number },
  ) {
    return this.bonusService.updateAdminConfig(type, body);
  }

  @Get('admin/recent')
  @Roles('ADMIN')
  getRecentBonuses(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.bonusService.getRecentBonuses(page, Math.min(pageSize, 50));
  }
}
