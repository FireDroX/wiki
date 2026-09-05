import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { AdminNav } from '#components/AdminNav'
import { UsersTable } from '#components/AdminUsers/UsersTable'
import { InputGroup, InputGroupAddon, InputGroupInput } from '#components/ui/input-group'
import { deleteUser, listUsers, updateRole, type AdminUser } from '#api/users'
import type { UserRole } from '#api/auth'
import { useAuth } from '#hooks/useAuth'
import { extractErrorMessage } from '#lib/api-errors'

type Status = 'loading' | 'ready' | 'error'

export function AdminUsers() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

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
      toast.success(t('admin.users.roleUpdated'))
    } catch (error) {
      toast.error(extractErrorMessage(error, t('admin.users.roleUpdateFailed')))
    } finally {
      setPendingUserId(null)
    }
  }

  async function handleDelete(user: AdminUser) {
    setPendingUserId(user.id)
    try {
      await deleteUser(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
      toast.success(t('admin.users.userDeleted'))
    } catch (error) {
      toast.error(extractErrorMessage(error, t('admin.users.userDeleteFailed')))
    } finally {
      setPendingUserId(null)
    }
  }

  const query = filter.trim().toLowerCase()
  const filteredUsers = query
    ? users.filter(
        (user) => user.displayName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
      )
    : users

  return (
    <div className="p-8">
      <AdminNav />
      {status === 'loading' && <p className="mt-5 text-sm text-muted-foreground">{t('common.loading')}</p>}
      {status === 'error' && <p className="mt-5 text-sm text-destructive">{t('admin.users.loadError')}</p>}
      {status === 'ready' && (
        <>
          <div className="mt-5 mb-4 flex items-center gap-3">
            <InputGroup className="max-w-[280px]">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={t('admin.users.filterPlaceholder')}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
            </InputGroup>
          </div>
          <UsersTable
            users={filteredUsers}
            currentUserId={currentUser?.id}
            pendingUserId={pendingUserId}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  )
}
