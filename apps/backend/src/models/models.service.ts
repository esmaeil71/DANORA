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
        return JSON.parse(cached) as Array<{
          id: string;
          provider: string;
          displayName: string;
        }>;
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

    try {
      await this.redis.client.setex(
        CACHE_KEY,
        CACHE_TTL_SEC,
        JSON.stringify(models),
      );
    } catch {
      /* ignore */
    }

    return models;
  }
}