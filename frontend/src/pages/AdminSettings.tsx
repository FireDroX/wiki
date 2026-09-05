import { useState } from 'react'
import { toast } from 'sonner'
import { AdminNav } from '#components/AdminNav'
import { Field, FieldLabel } from '#components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#components/ui/select'
import { updateSetting } from '#api/settings'
import { extractErrorMessage } from '#lib/api-errors'

const LOCALES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
]

export function AdminSettings() {
  const [locale, setLocale] = useState('fr')
  const [pending, setPending] = useState(false)

  async function handleLocaleChange(value: string) {
    const previous = locale
    setLocale(value)
    setPending(true)
    try {
      await updateSetting('locale', value)
      toast.success('Langue mise à jour.')
    } catch (error) {
      setLocale(previous)
      toast.error(extractErrorMessage(error, 'Échec de la mise à jour de la langue.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-4 p-6">
      <AdminNav />
      <h1 className="text-xl font-semibold">Paramètres</h1>
      <Field>
        <FieldLabel>Langue de l'interface</FieldLabel>
        <Select value={locale} onValueChange={handleLocaleChange} disabled={pending}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCALES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Réglage global appliqué à tous les visiteurs. Vous verrez le changement immédiatement, les autres à leur
          prochain chargement.
        </p>
      </Field>
    </div>
  )
}
