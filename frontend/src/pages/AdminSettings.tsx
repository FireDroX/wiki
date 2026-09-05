import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { AdminNav } from '#components/AdminNav'
import { Field, FieldLabel } from '#components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select'
import { updateSetting } from '#api/settings'
import { extractErrorMessage } from '#lib/api-errors'

export function AdminSettings() {
  const { t } = useTranslation()
  const [locale, setLocale] = useState('fr')
  const [pending, setPending] = useState(false)
  const locales = [
    { value: 'fr', label: t('admin.settings.localeFr') },
    { value: 'en', label: t('admin.settings.localeEn') },
  ]

  async function handleLocaleChange(value: string) {
    const previous = locale
    setLocale(value)
    setPending(true)
    try {
      await updateSetting('locale', value)
      toast.success(t('admin.settings.localeUpdated'))
    } catch (error) {
      setLocale(previous)
      toast.error(extractErrorMessage(error, t('admin.settings.localeUpdateFailed')))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="p-8">
      <AdminNav />
      <Field className="mt-5 max-w-sm">
        <FieldLabel>{t('admin.settings.localeLabel')}</FieldLabel>
        <Select value={locale} onValueChange={handleLocaleChange} disabled={pending}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locales.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{t('admin.settings.localeHelp')}</p>
      </Field>
    </div>
  )
}
