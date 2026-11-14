import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateApiTokenDto } from './dto/developer.dto';
import { DeveloperService } from './developer.service';

@Controller('developer')
@UseGuards(JwtAuthGuard)
export class DeveloperController {
  constructor(private readonly developer: DeveloperService) {}

  @Get('tokens')
  listTokens(@Req() req: Request & { user: { id: string } }) {
    return this.developer.listTokens(req.user.id);
  }

  @Post('tokens')
  createToken(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateApiTokenDto,
  ) {
    return this.developer.createToken(req.user.id, dto.name);
  }

  @Delete('tokens/:id')
  revokeToken(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.developer.revokeToken(req.user.id, id);
  }
}