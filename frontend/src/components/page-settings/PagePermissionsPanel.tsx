import { useEffect, useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
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
      toast.success('Droit accordé.')
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'ajout du droit."))
    } finally {
      setPendingUserId(null)
    }
  }

  async function handleRevoke(userId: string) {
    setPendingUserId(userId)
    try {
      await revokePermission(pageId, userId)
      setPermissions((current) => current.filter((permission) => permission.userId !== userId))
      toast.success('Droit révoqué.')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la révocation.'))
    } finally {
      setPendingUserId(null)
    }
  }

  if (status === 'error') {
    return null
  }

  return (
    <Field>
      <FieldLabel>Droits d'édition</FieldLabel>
      <div className="space-y-1.5">
        {status === 'loading' && <p className="text-sm text-muted-foreground">Chargement...</p>}
        {status === 'ready' && permissions.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun droit accordé sur cette page.</p>
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
                    <span className="sr-only">Révoquer ce droit</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Révoquer ce droit ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {user?.displayName ?? 'Cet utilisateur'} perdra son droit d'édition sur cette page (et sa
                      sous-arborescence, sauf autre grant plus proche).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRevoke(permission.userId)}>Révoquer</AlertDialogAction>
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
        <UserPlus /> Ajouter un éditeur
      </Button>
      <CommandDialog open={pickerOpen} onOpenChange={setPickerOpen} title="Accorder un droit d'édition">
        <Command>
          <CommandInput placeholder="Rechercher un utilisateur..." />
          <CommandList>
            <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
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
