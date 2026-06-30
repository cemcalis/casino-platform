import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, Roles, RolesGuard } from '@casino/auth';
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

  @Get('admin/players')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  listPlayers(
    @Query('search') search = '',
    @Query('status') status = '',
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.usersService.listPlayers(search, status, parseInt(page), parseInt(pageSize));
  }

  @Get('admin/players/:id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  getPlayerDetail(@Param('id') id: string) {
    return this.usersService.getPlayerDetail(id);
  }

  @Post('admin/players/:id/ban')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  banPlayer(@Param('id') id: string) {
    return this.usersService.banPlayer(id);
  }

  @Post('admin/players/:id/unban')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  unbanPlayer(@Param('id') id: string) {
    return this.usersService.unbanPlayer(id);
  }
}
