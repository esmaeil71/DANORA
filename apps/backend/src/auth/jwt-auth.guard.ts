import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DeveloperService } from '../developer/developer.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly developerService: DeveloperService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers?.authorization as string | undefined;

    if (auth?.startsWith('Bearer dnr_')) {
      try {
        const user = await this.developerService.resolveUserFromApiKey(
          auth.slice(7).trim(),
        );
        req.user = user;
        return true;
      } catch {
        throw new UnauthorizedException();
      }
    }

    const result = await super.canActivate(context);
    return result as boolean;
  }
}