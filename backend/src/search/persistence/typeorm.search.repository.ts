import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SearchMatch, SearchRepository } from './search.repository.js';

interface SearchRow {
  pageId: string;
  slug: string;
  title: string;
  content: string;
  score: number;
}

interface CountRow {
  total: string;
}

@Injectable()
export class TypeormSearchRepository implements SearchRepository {
  constructor(private readonly dataSource: DataSource) {}

  async search(
    query: string,
    page: number,
    limit: number,
    restrictToPublic: boolean,
  ): Promise<{ items: SearchMatch[]; total: number }> {
    const visibilityClause = restrictToPublic
      ? "AND p.is_published = true AND p.visibility = 'public'"
      : '';
    const offset = (page - 1) * limit;

    const rows = await this.dataSource.query<SearchRow[]>(
      `SELECT
         p.id AS pageId,
         p.slug AS slug,
         pv.title AS title,
         pv.content AS content,
         MATCH (pv.title, pv.content) AGAINST (? IN NATURAL LANGUAGE MODE) AS score
       FROM pages p
       INNER JOIN page_versions pv ON pv.id = p.current_version_id
       WHERE p.deleted_at IS NULL
         AND MATCH (pv.title, pv.content) AGAINST (? IN NATURAL LANGUAGE MODE)
         ${visibilityClause}
       ORDER BY score DESC
       LIMIT ? OFFSET ?`,
      [query, query, limit, offset],
    );

    const countRows = await this.dataSource.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM pages p
       INNER JOIN page_versions pv ON pv.id = p.current_version_id
       WHERE p.deleted_at IS NULL
         AND MATCH (pv.title, pv.content) AGAINST (? IN NATURAL LANGUAGE MODE)
         ${visibilityClause}`,
      [query],
    );

    return { items: rows, total: Number(countRows[0]?.total ?? 0) };
  }
}
