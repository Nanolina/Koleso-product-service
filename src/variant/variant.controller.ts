import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { OrganizationId } from '../common/decorators';
import { OrganizationIdGuard } from '../common/guards';
import { VariantService } from './variant.service';

@Controller('variant')
@UseGuards(OrganizationIdGuard)
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @Post(':id/recover')
  recover(@Param('id') id: string, @OrganizationId() organizationId: string) {
    return this.variantService.recover(id, organizationId);
  }
}
