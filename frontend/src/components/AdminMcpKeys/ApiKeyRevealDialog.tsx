import { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '#components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#components/ui/dialog'
import type { McpApiKeyCreated } from '#api/admin-mcp'

interface ApiKeyRevealDialogProps {
  apiKey: McpApiKeyCreated | null
  onClose: () => void
}

export function ApiKeyRevealDialog({ apiKey, onClose }: ApiKeyRevealDialogProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [confirmingClose, setConfirmingClose] = useState(false)

  useEffect(() => {
    setCopied(false)
    setConfirmingClose(false)
  }, [apiKey?.id])

  function handleCopy() {
    if (!apiKey) return
    void navigator.clipboard.writeText(apiKey.key)
    setCopied(true)
    toast.success(t('admin.mcpKeys.reveal.copiedToast'))
  }

  function requestClose() {
    if (!copied && !confirmingClose) {
      setConfirmingClose(true)
      return
    }
    onClose()
  }

  return (
    <Dialog open={apiKey !== null} onOpenChange={(next) => !next && requestClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.mcpKeys.reveal.title')}</DialogTitle>
          <DialogDescription>{t('admin.mcpKeys.reveal.description')}</DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border bg-muted p-3 font-mono text-sm break-all">{apiKey?.key}</div>

        <p className="text-sm text-destructive">{t('admin.mcpKeys.reveal.warning')}</p>

        {confirmingClose && !copied && (
          <p className="text-sm font-medium text-destructive">{t('admin.mcpKeys.reveal.confirmCloseWarning')}</p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCopy}>
            <Copy />
            {copied ? t('admin.mcpKeys.reveal.copiedButton') : t('admin.mcpKeys.reveal.copyButton')}
          </Button>
          <Button
            type="button"
            variant={confirmingClose && !copied ? 'destructive' : 'default'}
            onClick={requestClose}
          >
            {confirmingClose && !copied ? t('admin.mcpKeys.reveal.closeAnyway') : t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
