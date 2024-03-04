import { Controller, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { VariantService } from './variant.service';

@Controller('variant')
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @Post(':id/recover')
  recover(@Param('id') id: string, @Req() req: Request) {
    return this.variantService.recover(id, req.user.id);
  }
}
