import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import {
  PatchPreferencesDto,
  SupportInquiryDto,
  UpgradeRequestDto,
} from './dto/settings.dto';
import { PreferencesService } from './preferences.service';
import { SupportService } from './support.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly preferences: PreferencesService,
    private readonly billing: BillingService,
    private readonly support: SupportService,
  ) {}

  @Get('auth/preferences')
  getPreferences(@Req() req: Request & { user: { id: string } }) {
    return this.preferences.get(req.user.id);
  }

  @Patch('auth/preferences')
  patchPreferences(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: PatchPreferencesDto,
  ) {
    return this.preferences.patch(req.user.id, dto);
  }

  @Get('billing/usage-history')
  usageHistory(@Req() req: Request & { user: { id: string } }) {
    return this.billing.usageHistory(req.user.id);
  }

  @Get('billing/upgrade-requests')
  listUpgrades(@Req() req: Request & { user: { id: string } }) {
    return this.billing.listUpgradeRequests(req.user.id);
  }

  @Post('billing/upgrade-request')
  upgradeRequest(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: UpgradeRequestDto,
  ) {
    return this.billing.createUpgradeRequest(
      req.user.id,
      dto.note,
      dto.phone,
    );
  }

  @Get('support/inquiries')
  listInquiries(@Req() req: Request & { user: { id: string } }) {
    return this.support.listInquiries(req.user.id);
  }

  @Post('support/inquiries')
  createInquiry(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: SupportInquiryDto,
  ) {
    return this.support.createInquiry(req.user.id, dto.subject, dto.message);
  }
}