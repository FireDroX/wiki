import { useTranslation } from 'react-i18next'
import { Button } from '#components/ui/button'
import { cn } from '#lib/utils'

export function Home() {
  const { t } = useTranslation()
  return (
    <main className={cn('home-page', 'flex flex-col items-start gap-4 p-8')}>
      <h1 className="text-2xl font-semibold">{t('common.appName')}</h1>
      <Button>{t('home.getStarted')}</Button>
    </main>
  )
}
