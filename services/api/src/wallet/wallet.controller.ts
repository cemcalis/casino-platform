import { Controller, Get } from '@nestjs/common';
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
}
