import { Avatar, AvatarFallback } from '#components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#components/ui/table'
import { DeleteUserDialog } from '#components/AdminUsers/DeleteUserDialog'
import { UserRole } from '#api/auth'
import type { AdminUser } from '#api/users'
import { toInitials } from '#utils/initials'

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Editor]: 'Éditeur',
  [UserRole.Reader]: 'Lecteur',
}

function formatJoinDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface UsersTableProps {
  users: AdminUser[]
  currentUserId: string | undefined
  pendingUserId: string | null
  onRoleChange: (user: AdminUser, role: UserRole) => void
  onDelete: (user: AdminUser) => void
}

export function UsersTable({ users, currentUserId, pendingUserId, onRoleChange, onDelete }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Inscrit le</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId
          const isPending = pendingUserId === user.id
          return (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar>
                    <AvatarFallback>{toInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.displayName}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(role) => onRoleChange(user, role as UserRole)}
                  disabled={isSelf || isPending}
                >
                  <SelectTrigger
                    size="sm"
                    title={isSelf ? 'Vous ne pouvez pas modifier votre propre rôle.' : undefined}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatJoinDate(user.createdAt)}</TableCell>
              <TableCell>
                <DeleteUserDialog user={user} disabled={isSelf} pending={isPending} onConfirm={() => onDelete(user)} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
