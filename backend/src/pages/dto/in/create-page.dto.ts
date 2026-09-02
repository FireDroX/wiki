import { ApiProperty } from '@nestjs/swagger';
import { PAGE_VISIBILITIES } from '../../entities/page.entity.js';
import type { PageVisibility } from '../../entities/page.entity.js';

export class CreatePageDto {
  slug: string;
  title: string;
  content: string;
  parentId?: string | null;

  @ApiProperty({ enum: PAGE_VISIBILITIES })
  visibility: PageVisibility;
}
