import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { isConfiguredAdmin } from './admin-emails';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  private hashResetToken(plain: string) {
    return createHash('sha256').update(plain).digest('hex');
  }

  private passwordResetWebOrigin() {
    const dedicated = this.config.get<string>('PASSWORD_RESET_WEB_ORIGIN');
    if (dedicated?.trim()) return dedicated.trim().replace(/\/$/, '');
    const web = this.config.get<string>('WEB_ORIGIN') ?? '';
    const first = web.split(',')[0]?.trim();
    return (first || 'http://localhost:3000').replace(/\/$/, '');
  }

  async requestPasswordReset(email: string) {
    const generic = {
      ok: true as const,
      message:
        'اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی ارسال می‌شود.',
    };
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user || user.suspended) {
      return generic;
    }

    const plain = randomBytes(32).toString('base64url');
    const tokenHash = this.hashResetToken(plain);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrl = `${this.passwordResetWebOrigin()}/reset-password?token=${encodeURIComponent(plain)}`;
    await this.mail.sendPasswordReset(user.email, resetUrl);

    const exposeDev =
      this.config.get<string>('PASSWORD_RESET_DEV_EXPOSE') === 'true' &&
      process.env.NODE_ENV !== 'production';
    if (exposeDev) {
      return { ...generic, devResetUrl: resetUrl };
    }
    return generic;
  }

  async resetPasswordWithToken(token: string, newPassword: string) {
    const tokenHash = this.hashResetToken(token.trim());
    const row = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!row) {
      throw new BadRequestException('لینک بازیابی نامعتبر یا منقضی شده است');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      });
      await tx.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      });
      await tx.passwordResetToken.updateMany({
        where: {
          userId: row.userId,
          usedAt: null,
          id: { not: row.id },
        },
        data: { usedAt: new Date() },
      });
    });
    return { ok: true };
  }

  /** ایمیل‌های ADMIN_EMAILS را به نقش admin ارتقا می‌دهد (روی login و /auth/me) */
  async bootstrapAdminRole(userId: string, email: string) {
    if (!isConfiguredAdmin(this.config, email)) {
      return;
    }
    await this.prisma.user.updateMany({
      where: { id: userId, role: UserRole.user },
      data: { role: UserRole.admin },
    });
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const role = isConfiguredAdmin(this.config, email)
      ? UserRole.admin
      : UserRole.user;
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });
    await this.bootstrapAdminRole(user.id, user.email);
    return this.signToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('ایمیل یا رمز عبور نادرست است');
    }
    if (user.suspended) {
      throw new ForbiddenException('حساب کاربری مسدود شده است');
    }
    await this.bootstrapAdminRole(user.id, user.email);
    return this.signToken(user.id, user.email);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('رمز عبور فعلی نادرست است');
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { ok: true };
  }

  signToken(sub: string, email: string) {
    return this.jwt.sign({ sub, email });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        plan: true,
        role: true,
        suspended: true,
        createdAt: true,
      },
    });
    return user;
  }
}