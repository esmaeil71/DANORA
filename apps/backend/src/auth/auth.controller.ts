import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsageService } from '../usage/usage.service';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
    private readonly usageService: UsageService,
  ) {}

  private setAuthCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.auth.register(dto);
    this.setAuthCookie(res, token);
    return { ok: true };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.auth.login(dto);
    this.setAuthCookie(res, token);
    return { ok: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @Req()
    req: Request & {
      user: {
        id: string;
        email: string;
        plan: string;
        createdAt?: Date;
      };
    },
  ) {
    const { id, email, plan, createdAt } = req.user;
    return {
      id,
      email,
      plan,
      ...(createdAt && {
        createdAt:
          createdAt instanceof Date
            ? createdAt.toISOString()
            : new Date(createdAt).toISOString(),
      }),
    };
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  getUsageDaily(@Req() req: Request & { user: { id: string; plan: string } }) {
    return this.usageService.getDailySummary(req.user.id);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.auth.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}