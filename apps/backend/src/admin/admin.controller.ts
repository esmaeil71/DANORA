import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import {
  PatchAdminModelDto,
  PatchAdminUserDto,
  PatchUpgradeRequestDto,
} from './dto/admin.dto';

type AdminRequest = Request & { user: { id: string; role: string } };

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview() {
    return this.admin.overview();
  }

  @Get('users')
  listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    return this.admin.listUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      q,
    );
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.admin.getUser(id);
  }

  @Patch('users/:id')
  patchUser(
    @Req() req: AdminRequest,
    @Param('id') id: string,
    @Body() dto: PatchAdminUserDto,
  ) {
    return this.admin.patchUser(req.user.id, id, dto);
  }

  @Delete('users/:id')
  deleteUser(@Req() req: AdminRequest, @Param('id') id: string) {
    return this.admin.deleteUser(req.user.id, id);
  }

  @Post('users/:id/reset-usage-today')
  resetUsage(@Param('id') id: string) {
    return this.admin.resetUsageToday(id);
  }

  @Get('users/:id/conversations')
  userConversations(@Param('id') id: string) {
    return this.admin.listUserConversations(id);
  }

  @Get('conversations/:id/messages')
  conversationMessages(@Param('id') id: string) {
    return this.admin.listConversationMessages(id);
  }

  @Get('upgrade-requests')
  upgradeRequests() {
    return this.admin.listUpgradeRequests();
  }

  @Patch('upgrade-requests/:id')
  patchUpgrade(
    @Param('id') id: string,
    @Body() dto: PatchUpgradeRequestDto,
  ) {
    return this.admin.patchUpgradeRequest(id, dto);
  }

  @Get('support/inquiries')
  supportInquiries() {
    return this.admin.listSupportInquiries();
  }

  @Get('models')
  models() {
    return this.admin.listModels();
  }

  @Patch('models/:id')
  patchModel(@Param('id') id: string, @Body() dto: PatchAdminModelDto) {
    return this.admin.patchModel(id, dto);
  }
}