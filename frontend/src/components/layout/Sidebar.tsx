import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '#components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '#components/ui/input-group'
import { Sheet, SheetContent, SheetTitle } from '#components/ui/sheet'
import { PageTree } from '#components/layout/PageTree'
import { cn } from '#lib/utils'

function SidebarNav() {
  const [filter, setFilter] = useState('')

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      <InputGroup>
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Filtrer les pages..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </InputGroup>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 mb-3 justify-start gap-2 text-sidebar-foreground"
        disabled
      >
        <Plus className="size-4" />
        Nouvelle page
      </Button>
      <PageTree filter={filter} />
    </nav>
  )
}

interface SidebarProps {
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
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
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>
    </>
  )
}
