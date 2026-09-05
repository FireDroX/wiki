import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '#components/ui/button'
import { Checkbox } from '#components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#components/ui/dialog'
import { Field, FieldLabel } from '#components/ui/field'
import { Input } from '#components/ui/input'
import { createApiKey, MCP_SCOPES, type McpApiKeyCreated, type McpScope } from '#api/admin-mcp'
import { extractErrorMessage } from '#lib/api-errors'

interface CreateApiKeyDialogProps {
  onCreated: (key: McpApiKeyCreated) => void
}

export function CreateApiKeyDialog({ onCreated }: CreateApiKeyDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<Set<McpScope>>(new Set())
  const [pending, setPending] = useState(false)

  function toggleScope(scope: McpScope, checked: boolean) {
    setScopes((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(scope)
      } else {
        next.delete(scope)
      }
      return next
    })
  }

  function reset() {
    setName('')
    setScopes(new Set())
  }

  async function handleSubmit() {
    setPending(true)
    try {
      const created = await createApiKey(name.trim(), Array.from(scopes))
      onCreated(created)
      setOpen(false)
      reset()
      toast.success(t('admin.mcpKeys.created'))
    } catch (error) {
      toast.error(extractErrorMessage(error, t('admin.mcpKeys.createFailed')))
    } finally {
      setPending(false)
    }
  }

  const canSubmit = name.trim().length > 0 && scopes.size > 0 && !pending

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">
          <Plus />
          {t('admin.mcpKeys.createButton')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.mcpKeys.createTitle')}</DialogTitle>
          <DialogDescription>{t('admin.mcpKeys.createDescription')}</DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="mcp-key-name">{t('admin.mcpKeys.nameLabel')}</FieldLabel>
          <Input
            id="mcp-key-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('admin.mcpKeys.namePlaceholder')}
          />
        </Field>

        <Field>
          <FieldLabel>{t('admin.mcpKeys.scopesLabel')}</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {MCP_SCOPES.map((scope) => (
              <label key={scope} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={scopes.has(scope)}
                  onCheckedChange={(checked) => toggleScope(scope, checked === true)}
                />
                <span className="font-mono">{scope}</span>
              </label>
            ))}
          </div>
        </Field>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t('common.cancel')}
            </Button>
          </DialogClose>
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            {t('admin.mcpKeys.createSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
