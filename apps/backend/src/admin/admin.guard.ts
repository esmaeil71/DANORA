import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers?.authorization as string | undefined;

    if (auth?.startsWith('Bearer dnr_')) {
      throw new ForbiddenException('دسترسی ادمین فقط از مرورگر مجاز است');
    }

    const user = req.user as { role?: UserRole } | undefined;
    if (!user || user.role !== UserRole.admin) {
      throw new ForbiddenException('دسترسی ادمین لازم است');
    }

    return true;
  }
}