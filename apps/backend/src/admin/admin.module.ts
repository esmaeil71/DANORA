import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ModelsModule } from '../models/models.module';
import { ShopModule } from '../shop/shop.module';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, ModelsModule, ShopModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}