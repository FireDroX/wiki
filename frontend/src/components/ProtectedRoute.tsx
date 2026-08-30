import { Navigate, Outlet } from 'react-router'
import type { UserRole } from '#api/auth'
import { useAuth } from '#hooks/useAuth'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { status, user } = useAuth()

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
