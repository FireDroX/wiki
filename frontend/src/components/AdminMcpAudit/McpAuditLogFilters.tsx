import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select'
import type { McpApiKeySummary } from '#api/admin-mcp'

const ALL_KEYS_VALUE = 'all'

interface McpAuditLogFiltersProps {
  apiKeys: McpApiKeySummary[]
  apiKeyId: string | undefined
  onChange: (apiKeyId: string | undefined) => void
}

export function McpAuditLogFilters({ apiKeys, apiKeyId, onChange }: McpAuditLogFiltersProps) {
  const { t } = useTranslation()

  return (
    <Select
      value={apiKeyId ?? ALL_KEYS_VALUE}
      onValueChange={(value) => onChange(value === ALL_KEYS_VALUE ? undefined : value)}
    >
      <SelectTrigger className="w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_KEYS_VALUE}>{t('admin.mcpAudit.allKeys')}</SelectItem>
        {apiKeys.map((key) => (
          <SelectItem key={key.id} value={key.id}>
            {key.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
