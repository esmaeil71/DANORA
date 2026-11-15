import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { isConfiguredAdmin } from './admin-emails';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

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