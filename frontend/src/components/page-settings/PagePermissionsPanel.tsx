import { useEffect, useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
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
import { Button } from '#components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#components/ui/command'
import { Field, FieldLabel } from '#components/ui/field'
import { grantPermission, listPermissions, revokePermission, type PagePermission } from '#api/page-permissions'
import { listUsers, type AdminUser } from '#api/users'
import { extractErrorMessage } from '#lib/api-errors'

interface PagePermissionsPanelProps {
  pageId: string
}

type Status = 'loading' | 'ready' | 'error'

export function PagePermissionsPanel({ pageId }: PagePermissionsPanelProps) {
  const { t } = useTranslation()
  const [permissions, setPermissions] = useState<PagePermission[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const [permissionsResult, usersResult] = await Promise.all([listPermissions(pageId), listUsers()])
        if (cancelled) return
        setPermissions(permissionsResult)
        setUsers(usersResult.items)
        setStatus('ready')
      } catch {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [pageId])

  const usersById = new Map(users.map((user) => [user.id, user]))
  const grantableUsers = users.filter((user) => !permissions.some((permission) => permission.userId === user.id))

  async function handleGrant(userId: string) {
    setPickerOpen(false)
    setPendingUserId(userId)
    try {
      const permission = await grantPermission(pageId, userId)
      setPermissions((current) => [...current, permission])
      toast.success(t('permissions.granted'))
    } catch (error) {
      toast.error(extractErrorMessage(error, t('permissions.grantFailed')))
    } finally {
      setPendingUserId(null)
    }
  }

  async function handleRevoke(userId: string) {
    setPendingUserId(userId)
    try {
      await revokePermission(pageId, userId)
      setPermissions((current) => current.filter((permission) => permission.userId !== userId))
      toast.success(t('permissions.revoked'))
    } catch (error) {
      toast.error(extractErrorMessage(error, t('permissions.revokeFailed')))
    } finally {
      setPendingUserId(null)
    }
  }

  if (status === 'error') {
    return null
  }

  return (
    <Field>
      <FieldLabel>{t('permissions.title')}</FieldLabel>
      <div className="space-y-1.5">
        {status === 'loading' && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
        {status === 'ready' && permissions.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('permissions.none')}</p>
        )}
        {permissions.map((permission) => {
          const user = usersById.get(permission.userId)
          return (
            <div
              key={permission.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-input px-2.5 py-1.5 text-sm"
            >
              <span className="truncate">{user ? `${user.displayName} (${user.email})` : permission.userId}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={pendingUserId === permission.userId}
                  >
                    <X />
                    <span className="sr-only">{t('permissions.revokeSr')}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('permissions.revokeConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('permissions.revokeConfirmDescription', {
                        name: user?.displayName ?? t('permissions.thisUser'),
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRevoke(permission.userId)}>
                      {t('permissions.revoke')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 justify-start"
        onClick={() => setPickerOpen(true)}
        disabled={status !== 'ready'}
      >
        <UserPlus /> {t('permissions.addEditor')}
      </Button>
      <CommandDialog open={pickerOpen} onOpenChange={setPickerOpen} title={t('permissions.grantDialogTitle')}>
        <Command>
          <CommandInput placeholder={t('permissions.searchUserPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('permissions.noUserFound')}</CommandEmpty>
            <CommandGroup>
              {grantableUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.displayName} ${user.email}`}
                  onSelect={() => handleGrant(user.id)}
                >
                  {user.displayName} ({user.email})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </Field>
  )
}
