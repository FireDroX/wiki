import { Route, Routes } from 'react-router'
import { AppLayout } from '#components/layout/AppLayout'
import { AppLayoutSkeleton } from '#components/layout/AppLayoutSkeleton'
import { ProtectedRoute } from '#components/ProtectedRoute'
import { UserRole } from '#api/auth'
import { useAuth } from '#hooks/useAuth'
import { AdminUsers } from '#pages/AdminUsers'
import { Home } from '#pages/Home'
import { Login } from '#pages/Login'
import { PageView } from '#pages/PageView'

export function App() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <AppLayoutSkeleton />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="/pages/*" element={<PageView />} />
        <Route element={<ProtectedRoute roles={[UserRole.Admin]} />}>
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>
    </Routes>
  )
}
