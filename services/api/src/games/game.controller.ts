import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@casino/auth';
import type { JwtPayload } from '@casino/auth';
import { GameService } from './game.service';
import { SpinDto } from './dto/spin.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('spin')
  spin(@CurrentUser() user: JwtPayload, @Body() dto: SpinDto) {
    return this.gameService.spin(user.sub, dto);
  }

  @Get('history')
  getHistory(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.gameService.getHistory(user.sub, page, Math.min(pageSize, 50));
  }
}
