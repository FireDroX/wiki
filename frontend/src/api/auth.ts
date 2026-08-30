import { apiClient } from '#lib/api-client'
import type { ResponseDto } from '#api/response-dto'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  displayName: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export const UserRole = {
  Admin: 'admin',
  Editor: 'editor',
  Reader: 'reader',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface AuthUser {
  id: string
  email: string
  displayName: string
  role: UserRole
}

export async function login(payload: LoginPayload): Promise<TokenPair> {
  const { data } = await apiClient.post<ResponseDto<TokenPair>>('/auth/login', payload)
  return data.data
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<ResponseDto<AuthUser>>('/auth/register', payload)
  return data.data
}
