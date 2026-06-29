import { Controller, Post } from '@nestjs/common';
import { CurrentUser, type JwtPayload } from '@casino/auth';
import { BonusService } from './bonus.service';

@Controller('bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Post('daily')
  claimDaily(@CurrentUser() user: JwtPayload) {
    return this.bonusService.claimDailyBonus(user.sub);
  }
}
