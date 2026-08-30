import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '#components/layout/AppLayout'
import { Home } from '#pages/Home'
import { Login } from '#pages/Login'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
    ],
  },
])
