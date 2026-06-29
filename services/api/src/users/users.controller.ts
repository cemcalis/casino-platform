import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '@casino/auth';
import type { JwtPayload } from '@casino/auth';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Get('me/stats')
  getMyStats(@CurrentUser() user: JwtPayload) {
    return this.usersService.getStats(user.sub);
  }

  @Get('me/vip')
  getMyVip(@CurrentUser() user: JwtPayload) {
    return this.usersService.getVipStatus(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }
}
