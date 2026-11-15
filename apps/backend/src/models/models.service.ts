import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CACHE_KEY = 'model_catalog:enabled';
const CACHE_TTL_SEC = 60;

@Injectable()
export class ModelsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async listEnabled() {
    try {
      await this.redis.client.connect();
      const cached = await this.redis.client.get(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Array<{
          id: string;
          provider: string;
          displayName: string;
        }>;
        if (parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      /* Redis optional for local dev */
    }

    const models = await this.prisma.modelCatalog.findMany({
      where: { enabled: true },
      select: {
        id: true,
        provider: true,
        displayName: true,
      },
      orderBy: { displayName: 'asc' },
    });

    if (models.length > 0) {
      try {
        await this.redis.client.setex(
          CACHE_KEY,
          CACHE_TTL_SEC,
          JSON.stringify(models),
        );
      } catch {
        /* ignore */
      }
    } else {
      try {
        await this.redis.client.del(CACHE_KEY);
      } catch {
        /* ignore */
      }
    }

    return models;
  }

  async invalidateEnabledCache() {
    try {
      await this.redis.client.connect();
      await this.redis.client.del(CACHE_KEY);
    } catch {
      /* Redis optional */
    }
  }

  async listAllForAdmin() {
    return this.prisma.modelCatalog.findMany({
      orderBy: { displayName: 'asc' },
    });
  }

  async updateForAdmin(
    id: string,
    data: { enabled?: boolean; displayName?: string },
  ) {
    const row = await this.prisma.modelCatalog.update({
      where: { id },
      data,
    });
    await this.invalidateEnabledCache();
    return row;
  }
}