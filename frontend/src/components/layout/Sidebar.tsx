import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { UserRole } from '#api/auth'
import { Button } from '#components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '#components/ui/input-group'
import { Sheet, SheetContent, SheetTitle } from '#components/ui/sheet'
import { PageTree } from '#components/layout/PageTree'
import { useAuth } from '#hooks/useAuth'
import { cn } from '#lib/utils'

const EDITOR_ROLES: UserRole[] = [UserRole.Editor, UserRole.Admin]

function SidebarNav() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('')
  const { user } = useAuth()
  const canCreate = !!user && EDITOR_ROLES.includes(user.role)

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      <InputGroup>
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={t('sidebar.filterPlaceholder')}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </InputGroup>
      {canCreate && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 mb-3 justify-start gap-2 text-sidebar-foreground"
          asChild
        >
          <Link to="/new">
            <Plus className="size-4" />
            {t('sidebar.newPage')}
          </Link>
        </Button>
      )}
      <PageTree filter={filter} />
    </nav>
  )
}

interface SidebarProps {
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <>
      <aside
        className={cn(
          'hidden w-[280px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex'
        )}
      >
        <SidebarNav />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-[280px] border-sidebar-border bg-sidebar p-0 sm:max-w-[280px]"
        >
          <SheetTitle className="sr-only">{t('sidebar.navLabel')}</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>
    </>
  )
}
