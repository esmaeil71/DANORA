import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  defaultPreferences,
  mergePreferences,
  UserPreferences,
} from './preferences.types';

@Injectable()
export class PreferencesService {
  constructor(private prisma: PrismaService) {}

  async get(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    return mergePreferences(user?.preferences ?? defaultPreferences);
  }

  async patch(userId: string, patch: UserPreferences) {
    const current = await this.get(userId);
    const next = mergePreferences({ ...current, ...patch });
    await this.prisma.user.update({
      where: { id: userId },
      data: { preferences: next },
    });
    return next;
  }
}