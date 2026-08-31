import { PageTreeNodeDto } from '../dto/out/page-tree-node.dto.js';
import { Page } from '../entities/page.entity.js';

export class PageTreeMapper {
  static buildTree(pages: Page[]): PageTreeNodeDto[] {
    const nodesById = new Map<string, PageTreeNodeDto>();
    for (const page of pages) {
      nodesById.set(page.id, {
        id: page.id,
        slug: page.slug,
        title: page.title,
        children: [],
      });
    }

    const roots: PageTreeNodeDto[] = [];
    for (const page of pages) {
      const node = nodesById.get(page.id)!;
      const parent = page.parentId ? nodesById.get(page.parentId) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
