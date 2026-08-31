import { PageVisibility } from '../../entities/page.entity.js';

export class CreatePageDto {
  slug: string;
  title: string;
  content: string;
  parentId?: string | null;
  visibility: PageVisibility;
}
