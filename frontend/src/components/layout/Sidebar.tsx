import { Link } from 'react-router'
import { Sheet, SheetContent, SheetTitle } from '#components/ui/sheet'
import { cn } from '#lib/utils'

function SidebarNav() {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      <Link
        to="/"
        className="rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        Accueil
      </Link>
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
