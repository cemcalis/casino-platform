import { Controller, Get, Post, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { CurrentUser } from '@casino/auth';
import type { JwtPayload } from '@casino/auth';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: JwtPayload) {
    return this.walletService.getWallet(user.sub);
  }

  @Get('ledger')
  getLedger(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.walletService.getLedger(user.sub, page, Math.min(pageSize, 50));
  }

  @Get('bonus-status')
  getBonusStatus(@CurrentUser() user: JwtPayload) {
    return this.walletService.getBonusStatus(user.sub);
  }

  @Post('daily-bonus')
  claimDailyBonus(@CurrentUser() user: JwtPayload) {
    return this.walletService.claimDailyBonus(user.sub);
  }

  @Post('welcome-bonus')
  claimWelcomeBonus(@CurrentUser() user: JwtPayload) {
    return this.walletService.claimWelcomeBonus(user.sub);
  }
}
