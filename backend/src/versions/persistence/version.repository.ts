import { PageVersion } from '../../pages/entities/page-version.entity.js';

export interface CreateVersionInput {
  pageId: string;
  content: string;
  title: string;
  authorId: string;
  changeSummary: string | null;
}

export interface VersionsRepository {
  create(input: CreateVersionInput): Promise<PageVersion>;
}
