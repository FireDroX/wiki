import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { UsersTable } from '#components/AdminUsers/UsersTable'
import { deleteUser, listUsers, updateRole, type AdminUser } from '#api/users'
import type { UserRole } from '#api/auth'
import { useAuth } from '#hooks/useAuth'
import { extractErrorMessage } from '#lib/api-errors'

type Status = 'loading' | 'ready' | 'error'

export function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const result = await listUsers()
        if (cancelled) return
        setUsers(result.items)
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
  }, [])

  async function handleRoleChange(user: AdminUser, role: UserRole) {
    setPendingUserId(user.id)
    try {
      const updated = await updateRole(user.id, role)
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      toast.success('Rôle mis à jour.')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la mise à jour du rôle.'))
    } finally {
      setPendingUserId(null)
    }
  }

  async function handleDelete(user: AdminUser) {
    setPendingUserId(user.id)
    try {
      await deleteUser(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
      toast.success('Utilisateur supprimé.')
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de la suppression de l'utilisateur."))
    } finally {
      setPendingUserId(null)
    }
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Utilisateurs</h1>
      {status === 'loading' && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {status === 'error' && <p className="text-sm text-destructive">Échec du chargement des utilisateurs.</p>}
      {status === 'ready' && (
        <UsersTable
          users={users}
          currentUserId={currentUser?.id}
          pendingUserId={pendingUserId}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
