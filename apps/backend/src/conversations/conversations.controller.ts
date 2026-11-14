import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import {
  CreateConversationDto,
  UpdateConversationDto,
} from './dto/conversation.dto';

type AuthRequest = Request & {
  user: { id: string; email: string; plan: string };
};

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private conversations: ConversationsService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.conversations.list(req.user.id);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateConversationDto) {
    return this.conversations.create(req.user.id, dto);
  }

  @Get(':id/messages')
  messages(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.conversations.getMessages(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.conversations.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.conversations.remove(req.user.id, id);
  }
}