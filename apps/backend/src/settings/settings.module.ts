import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BillingService } from './billing.service';
import { PreferencesService } from './preferences.service';
import { SettingsController } from './settings.controller';
import { SupportService } from './support.service';

@Module({
  imports: [AuthModule],
  controllers: [SettingsController],
  providers: [PreferencesService, BillingService, SupportService],
  exports: [PreferencesService],
})
export class SettingsModule {}