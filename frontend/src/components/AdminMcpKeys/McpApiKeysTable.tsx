import { Ban } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#components/ui/alert-dialog'
import { Badge } from '#components/ui/badge'
import { Button } from '#components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#components/ui/table'
import type { McpApiKeySummary } from '#api/admin-mcp'
import { cn } from '#lib/utils'
import { formatRelativeTime } from '#utils/relative-time'

interface McpApiKeysTableProps {
  keys: McpApiKeySummary[]
  pendingKeyId: string | null
  onRevoke: (key: McpApiKeySummary) => void
}

export function McpApiKeysTable({ keys, pendingKeyId, onRevoke }: McpApiKeysTableProps) {
  const { t } = useTranslation()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('admin.mcpKeys.columnName')}</TableHead>
          <TableHead>{t('admin.mcpKeys.columnScopes')}</TableHead>
          <TableHead>{t('admin.mcpKeys.columnLastUsed')}</TableHead>
          <TableHead>{t('admin.mcpKeys.columnStatus')}</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => {
          const isRevoked = key.revokedAt !== null
          const isPending = pendingKeyId === key.id
          return (
            <TableRow key={key.id} className={cn(isRevoked && 'opacity-50')}>
              <TableCell className="font-medium">{key.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {key.scopes.map((scope) => (
                    <Badge key={scope} variant="secondary" className="font-mono">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : t('admin.mcpKeys.neverUsed')}
              </TableCell>
              <TableCell>
                {isRevoked ? (
                  <Badge variant="destructive">{t('admin.mcpKeys.statusRevoked')}</Badge>
                ) : (
                  <Badge variant="outline">{t('admin.mcpKeys.statusActive')}</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" disabled={isRevoked || isPending}>
                        <Ban />
                        <span className="sr-only">{t('admin.mcpKeys.revokeSr', { name: key.name })}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.mcpKeys.revokeConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('admin.mcpKeys.revokeConfirmDescription', { name: key.name })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => onRevoke(key)}>
                          {t('admin.mcpKeys.revokeConfirmAction')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
