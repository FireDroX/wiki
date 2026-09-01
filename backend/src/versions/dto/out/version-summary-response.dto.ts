export interface VersionSummaryResponseDto {
  id: string;
  authorId: string;
  changeSummary: string | null;
  createdAt: Date;
}
