const ACCESS_TOKEN_COOKIE = 'openwiki_access_token'
const REFRESH_TOKEN_COOKIE = 'openwiki_refresh_token'

function setCookie(name: string, value: string): void {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=Lax${secure}`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_COOKIE)
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_COOKIE)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  setCookie(ACCESS_TOKEN_COOKIE, accessToken)
  setCookie(REFRESH_TOKEN_COOKIE, refreshToken)
}

export function clearTokens(): void {
  deleteCookie(ACCESS_TOKEN_COOKIE)
  deleteCookie(REFRESH_TOKEN_COOKIE)
}
