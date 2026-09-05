import { useTranslation } from 'react-i18next'
import { Badge } from '#components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#components/ui/table'
import type { McpAuditLogItem } from '#api/admin-mcp'
import { formatRelativeTime } from '#utils/relative-time'

interface McpAuditLogTableProps {
  items: McpAuditLogItem[]
  onSelect: (item: McpAuditLogItem) => void
}

export function McpAuditLogTable({ items, onSelect }: McpAuditLogTableProps) {
  const { t } = useTranslation()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('admin.mcpAudit.columnKey')}</TableHead>
          <TableHead>{t('admin.mcpAudit.columnTool')}</TableHead>
          <TableHead>{t('admin.mcpAudit.columnStatus')}</TableHead>
          <TableHead>{t('admin.mcpAudit.columnDate')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="cursor-pointer" onClick={() => onSelect(item)}>
            <TableCell>{item.apiKeyName}</TableCell>
            <TableCell className="font-mono">{item.toolName}</TableCell>
            <TableCell>
              {item.success ? (
                <Badge variant="outline">{t('admin.mcpAudit.statusSuccess')}</Badge>
              ) : (
                <Badge variant="destructive">{t('admin.mcpAudit.statusFailure')}</Badge>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatRelativeTime(item.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
