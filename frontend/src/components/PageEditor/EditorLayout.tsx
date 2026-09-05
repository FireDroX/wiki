import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '#components/ui/button'

interface EditorLayoutProps {
  backTo: string
  title: ReactNode
  actions: ReactNode
  sidebar: ReactNode
  children: ReactNode
}

export function EditorLayout({ backTo, title, actions, sidebar, children }: EditorLayoutProps) {
  const { t } = useTranslation()
  return (
    <div className="flex h-svh flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 sm:px-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to={backTo}>
            <ArrowLeft />
            <span className="sr-only">{t('common.back')}</span>
          </Link>
        </Button>
        <h1 className="min-w-0 flex-1 truncate font-heading text-base font-semibold">{title}</h1>
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="w-full shrink-0 overflow-y-auto border-b border-border bg-muted/30 p-5 md:h-full md:w-72 md:border-r md:border-b-0">
          {sidebar}
        </aside>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}
