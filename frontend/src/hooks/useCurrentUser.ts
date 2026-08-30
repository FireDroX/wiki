import type { UserRole } from '#api/auth'
import { useAuth } from '#hooks/useAuth'

export interface CurrentUser {
  displayName: string
  initials: string
  role: UserRole
}

function toInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]]
  return initials
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

export function useCurrentUser(): CurrentUser | null {
  const { user } = useAuth()
  if (!user) {
    return null
  }
  return {
    displayName: user.displayName,
    initials: toInitials(user.displayName),
    role: user.role,
  }
}
