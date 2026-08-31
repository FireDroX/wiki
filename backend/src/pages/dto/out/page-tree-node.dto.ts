export interface PageTreeNodeDto {
  id: string;
  slug: string;
  title: string;
  children: PageTreeNodeDto[];
}
