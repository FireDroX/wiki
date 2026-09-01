export type DiffChangeType = 'added' | 'removed' | 'unchanged';

export interface DiffChange {
  type: DiffChangeType;
  value: string;
}

export interface DiffResponseDto {
  from: string;
  to: string;
  changes: DiffChange[];
}
