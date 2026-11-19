import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ModelRouterModule } from '../model-router/model-router.module';
import { RedisModule } from '../redis/redis.module';
import { UsageModule } from '../usage/usage.module';
import { DigikalaProvider } from './providers/digikala.provider';
import { TorobProvider } from './providers/torob.provider';
import { ShopCacheService } from './shop-cache.service';
import { ShopConfigService } from './shop-config.service';
import { ShopController } from './shop.controller';
import { ShopIntentService } from './shop-intent.service';
import { ShopOrchestratorService } from './shop-orchestrator.service';
import { ShopRankingService } from './shop-ranking.service';
import { ShopService } from './shop.service';

@Module({
  imports: [AuthModule, ModelRouterModule, UsageModule, RedisModule],
  controllers: [ShopController],
  providers: [
    ShopService,
    ShopOrchestratorService,
    ShopIntentService,
    ShopRankingService,
    ShopCacheService,
    ShopConfigService,
    DigikalaProvider,
    TorobProvider,
  ],
  exports: [ShopOrchestratorService],
})
export class ShopModule {}