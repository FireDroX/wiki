export interface VersionDetailResponseDto {
  id: string;
  pageId: string;
  title: string;
  content: string;
  authorId: string;
  changeSummary: string | null;
  createdAt: Date;
}
