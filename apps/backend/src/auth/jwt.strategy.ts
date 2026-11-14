import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isConfiguredAdmin } from './admin-emails';

export type JwtPayload = { sub: string; email: string };

function cookieExtractor(req: Request): string | null {
  if (req?.cookies?.access_token) {
    return req.cookies.access_token;
  }
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.suspended) {
      throw new UnauthorizedException('حساب کاربری مسدود شده است');
    }

    let role = user.role;
    if (isConfiguredAdmin(this.config, user.email) && user.role !== UserRole.admin) {
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.admin },
      });
      role = updated.role;
    }

    return {
      id: user.id,
      email: user.email,
      plan: user.plan,
      role,
      suspended: user.suspended,
      createdAt: user.createdAt,
    };
  }
}