import { NavLink } from 'react-router'
import { cn } from '#lib/utils'

const ADMIN_LINKS = [
  { to: '/admin/users', label: 'Utilisateurs' },
  { to: '/admin/settings', label: 'Paramètres' },
]

export function AdminNav() {
  return (
    <nav className="flex gap-4 border-b border-border pb-2">
      {ADMIN_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              'text-sm font-medium text-muted-foreground hover:text-foreground',
              isActive && 'text-foreground underline underline-offset-4',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
