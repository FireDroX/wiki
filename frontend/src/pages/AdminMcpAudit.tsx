import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { AdminNav } from '#components/AdminNav'
import { Button } from '#components/ui/button'
import { McpAuditLogDetailDialog } from '#components/AdminMcpAudit/McpAuditLogDetailDialog'
import { McpAuditLogFilters } from '#components/AdminMcpAudit/McpAuditLogFilters'
import { McpAuditLogTable } from '#components/AdminMcpAudit/McpAuditLogTable'
import { getAuditLog, listApiKeys, type McpApiKeySummary, type McpAuditLogItem } from '#api/admin-mcp'

const PAGE_LIMIT = 50

type Status = 'loading' | 'ready' | 'error'

function parsePage(raw: string | null): number {
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export function AdminMcpAudit() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const apiKeyId = searchParams.get('apiKeyId') ?? undefined
  const page = parsePage(searchParams.get('page'))

  const [apiKeys, setApiKeys] = useState<McpApiKeySummary[]>([])
  const [items, setItems] = useState<McpAuditLogItem[]>([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [selected, setSelected] = useState<McpAuditLogItem | null>(null)

  useEffect(() => {
    void listApiKeys().then(setApiKeys).catch(() => undefined)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const result = await getAuditLog({ apiKeyId, page, limit: PAGE_LIMIT })
        if (cancelled) return
        setItems(result.items)
        setTotal(result.total)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [apiKeyId, page])

  function updateParams(next: { apiKeyId?: string; page?: number }) {
    const params = new URLSearchParams(searchParams)
    if (next.apiKeyId !== undefined) {
      if (next.apiKeyId) {
        params.set('apiKeyId', next.apiKeyId)
      } else {
        params.delete('apiKeyId')
      }
      params.delete('page')
    }
    if (next.page !== undefined) {
      params.set('page', String(next.page))
    }
    setSearchParams(params)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  return (
    <div className="p-8">
      <AdminNav />
      <div className="mt-5 mb-4">
        <McpAuditLogFilters
          apiKeys={apiKeys}
          apiKeyId={apiKeyId}
          onChange={(next) => updateParams({ apiKeyId: next ?? '' })}
        />
      </div>

      {status === 'loading' && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
      {status === 'error' && <p className="text-sm text-destructive">{t('admin.mcpAudit.loadError')}</p>}
      {status === 'ready' && items.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('admin.mcpAudit.empty')}</p>
      )}
      {status === 'ready' && items.length > 0 && (
        <>
          <McpAuditLogTable items={items} onSelect={setSelected} />
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: page - 1 })}
              >
                {t('common.previous')}
              </Button>
              <span>{t('common.pageOf', { page, total: totalPages })}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: page + 1 })}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      )}

      <McpAuditLogDetailDialog item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
