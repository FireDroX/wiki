import { Route, Routes } from 'react-router'
import { AppLayout } from '#components/layout/AppLayout'
import { AppLayoutSkeleton } from '#components/layout/AppLayoutSkeleton'
import { ProtectedRoute } from '#components/ProtectedRoute'
import { UserRole } from '#api/auth'
import { useAuth } from '#hooks/useAuth'
import { AdminUsers } from '#pages/AdminUsers'
import { Home } from '#pages/Home'
import { Login } from '#pages/Login'
import { PageCreate } from '#pages/PageCreate'
import { PageEditor } from '#pages/PageEditor'
import { PageView } from '#pages/PageView'

const EDITOR_ROLES = [UserRole.Editor, UserRole.Admin]

export function App() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <AppLayoutSkeleton />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute roles={EDITOR_ROLES} />}>
        <Route path="/new" element={<PageCreate />} />
        <Route path="/edit/*" element={<PageEditor />} />
      </Route>
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
