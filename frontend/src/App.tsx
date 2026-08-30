import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '#components/layout/AppLayout'
import { AppLayoutSkeleton } from '#components/layout/AppLayoutSkeleton'
import { useAuth } from '#hooks/useAuth'
import { Home } from '#pages/Home'
import { Login } from '#pages/Login'

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
      </Route>
    </Routes>
  )
}
