import { isAxiosError } from 'axios'
import i18n from '#lib/i18n'

export function extractErrorMessage(error: unknown, fallback = i18n.t('errors.generic')): string {
  if (isAxiosError(error) && typeof error.response?.data?.error === 'string') {
    return error.response.data.error
  }
  return fallback
}
