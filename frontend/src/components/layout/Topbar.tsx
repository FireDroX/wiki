import { LogOut, Menu, Search, Shield, User } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar, AvatarFallback } from '#components/ui/avatar'
import { Button } from '#components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '#components/ui/input-group'
import { UserRole } from '#api/auth'
import { useAuth } from '#hooks/useAuth'
import { useCurrentUser } from '#hooks/useCurrentUser'

interface TopbarProps {
  onOpenSidebar: () => void
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const user = useCurrentUser()
  const { status, logout } = useAuth()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSidebar}>
        <Menu />
        <span className="sr-only">Ouvrir la navigation</span>
      </Button>
      <InputGroup className="max-w-md">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Rechercher dans le wiki..." disabled />
      </InputGroup>
      {status === 'authenticated' ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-auto rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Avatar>
              <AvatarFallback>{user?.initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User />
              Profil
            </DropdownMenuItem>
            {user?.role === UserRole.Admin && (
              <DropdownMenuItem>
                <Shield />
                Administration
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Connexion</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/login?tab=register">Inscription</Link>
          </Button>
        </div>
      )}
    </header>
  )
}
