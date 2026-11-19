import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module';
import { ShopModule } from './shop/shop.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ModelsModule } from './models/models.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // ریشه monorepo اول — کلیدهای جدید فقط در .env ریشه هم خوانده می‌شوند
      envFilePath: [
        resolve(__dirname, '../../.env'),
        resolve(__dirname, '../../.env.local'),
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '.env.local'),
      ],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    ModelsModule,
    ConversationsModule,
    ChatModule,
    SettingsModule,
    AdminModule,
    ShopModule,
  ],
})
export class AppModule {}