import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '@casino/auth';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const COOKIE_NAME = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(dto);
    res.cookie(COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS);
    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    res.cookie(COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS);
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[COOKIE_NAME] as string | undefined;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    const tokens = await this.authService.refreshFromToken(refreshToken);
    res.cookie(COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[COOKIE_NAME] as string | undefined;
    if (refreshToken) {
      await this.authService.logoutFromToken(refreshToken);
    }
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { success: true };
  }
}
