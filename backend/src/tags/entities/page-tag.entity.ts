import { Entity, PrimaryColumn } from 'typeorm';

@Entity('page_tags')
export class PageTag {
  @PrimaryColumn({ type: 'uuid', name: 'page_id', length: 36 })
  pageId: string;

  @PrimaryColumn({ type: 'uuid', name: 'tag_id', length: 36 })
  tagId: string;
}
