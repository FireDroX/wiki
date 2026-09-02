import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadMediaDto {
  @ApiPropertyOptional({
    description: 'Page à laquelle rattacher le fichier',
  })
  pageId?: string;
}
