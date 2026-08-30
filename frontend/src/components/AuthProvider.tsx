import { useEffect, useState, type ReactNode } from 'react'
import * as authApi from '#api/auth'
import { getMe } from '#api/users'
import type { AuthUser, LoginPayload, RegisterPayload } from '#api/auth'
import { clearTokens, getAccessToken, setTokens } from '#lib/auth-storage'
import { AuthContext, type AuthStatus } from '#hooks/useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    if (!getAccessToken()) {
      setStatus('unauthenticated')
      return
    }
    getMe()
      .then((currentUser) => {
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => {
        clearTokens()
        setStatus('unauthenticated')
      })
  }, [])

  async function login(payload: LoginPayload) {
    const tokens = await authApi.login(payload)
    setTokens(tokens.accessToken, tokens.refreshToken)
    const currentUser = await getMe()
    setUser(currentUser)
    setStatus('authenticated')
  }

  async function register(payload: RegisterPayload) {
    await authApi.register(payload)
    await login({ email: payload.email, password: payload.password })
  }

  function logout() {
    clearTokens()
    setUser(null)
    setStatus('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
