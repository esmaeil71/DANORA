import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {
  constructor(private models: ModelsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list() {
    return this.models.listEnabled();
  }
}