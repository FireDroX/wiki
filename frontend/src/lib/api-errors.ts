import { isAxiosError } from 'axios'

export function extractErrorMessage(error: unknown, fallback = 'Une erreur est survenue, veuillez réessayer.'): string {
  if (isAxiosError(error) && typeof error.response?.data?.error === 'string') {
    return error.response.data.error
  }
  return fallback
}
