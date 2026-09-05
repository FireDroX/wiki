import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#components/ui/table'
import { DeleteUserDialog } from '#components/AdminUsers/DeleteUserDialog'
import { UserRole } from '#api/auth'
import type { AdminUser } from '#api/users'

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Editor]: 'Éditeur',
  [UserRole.Reader]: 'Lecteur',
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
          <TableHead>Email</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId
          const isPending = pendingUserId === user.id
          return (
            <TableRow key={user.id}>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell className="font-medium">{user.displayName}</TableCell>
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
              <TableCell className="text-right">
                <DeleteUserDialog user={user} disabled={isSelf} pending={isPending} onConfirm={() => onDelete(user)} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
