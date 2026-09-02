import { Checkbox } from '#components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#components/ui/table'
import { VersionContentDialog } from '#components/PageHistory/VersionContentDialog'
import type { VersionSummary } from '#api/versions'
import { formatRelativeTime } from '#utils/relative-time'

interface VersionHistoryTableProps {
  pageId: string
  versions: VersionSummary[]
  currentUserId: string | undefined
  selectedIds: string[]
  onToggleSelected: (versionId: string) => void
}

function authorLabel(authorId: string, currentUserId: string | undefined): string {
  if (authorId === currentUserId) {
    return 'Vous'
  }
  return `${authorId.slice(0, 8)}…`
}

export function VersionHistoryTable({
  pageId,
  versions,
  currentUserId,
  selectedIds,
  onToggleSelected,
}: VersionHistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Auteur</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Résumé</TableHead>
          <TableHead className="text-right">Actions</TableHead>
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
            <TableCell className="font-medium">{authorLabel(version.authorId, currentUserId)}</TableCell>
            <TableCell className="text-muted-foreground" title={new Date(version.createdAt).toLocaleString('fr-FR')}>
              {formatRelativeTime(version.createdAt)}
            </TableCell>
            <TableCell className="max-w-[140px] truncate text-muted-foreground">
              {version.changeSummary ?? '—'}
            </TableCell>
            <TableCell className="text-right">
              <VersionContentDialog pageId={pageId} versionId={version.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
