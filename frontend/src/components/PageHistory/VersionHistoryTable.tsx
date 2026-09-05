import { useTranslation } from 'react-i18next'
import { Checkbox } from '#components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#components/ui/table'
import { RestoreVersionButton } from '#components/PageHistory/RestoreVersionButton'
import { VersionContentDialog } from '#components/PageHistory/VersionContentDialog'
import type { VersionSummary } from '#api/versions'
import { formatDateTime, formatRelativeTime } from '#utils/relative-time'

interface VersionHistoryTableProps {
  pageId: string
  versions: VersionSummary[]
  currentUserId: string | undefined
  selectedIds: string[]
  onToggleSelected: (versionId: string) => void
  canRestore: boolean
  onRestored: () => void
}

export function VersionHistoryTable({
  pageId,
  versions,
  currentUserId,
  selectedIds,
  onToggleSelected,
  canRestore,
  onRestored,
}: VersionHistoryTableProps) {
  const { t } = useTranslation()

  function authorLabel(authorId: string): string {
    if (authorId === currentUserId) {
      return t('pageHistory.you')
    }
    return `${authorId.slice(0, 8)}…`
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>{t('pageHistory.columnAuthor')}</TableHead>
          <TableHead>{t('pageHistory.columnDate')}</TableHead>
          <TableHead>{t('pageHistory.columnSummary')}</TableHead>
          <TableHead className="text-right">{t('pageHistory.columnActions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {versions.map((version) => (
          <TableRow key={version.id}>
            <TableCell>
              <Checkbox
                checked={selectedIds.includes(version.id)}
                onCheckedChange={() => onToggleSelected(version.id)}
              />
            </TableCell>
            <TableCell className="font-medium">{authorLabel(version.authorId)}</TableCell>
            <TableCell className="text-muted-foreground" title={formatDateTime(version.createdAt)}>
              {formatRelativeTime(version.createdAt)}
            </TableCell>
            <TableCell className="max-w-[140px] truncate text-muted-foreground">
              {version.changeSummary ?? t('pageHistory.noSummary')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <VersionContentDialog pageId={pageId} versionId={version.id} />
                {canRestore && (
                  <RestoreVersionButton pageId={pageId} versionId={version.id} onRestored={onRestored} />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
