import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#components/ui/alert-dialog'
import { Button } from '#components/ui/button'
import type { AdminUser } from '#api/users'

interface DeleteUserDialogProps {
  user: AdminUser
  disabled: boolean
  pending: boolean
  onConfirm: () => void
}

export function DeleteUserDialog({ user, disabled, pending, onConfirm }: DeleteUserDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled || pending}
          title={disabled ? 'Vous ne pouvez pas supprimer votre propre compte.' : undefined}
        >
          <Trash2 />
          <span className="sr-only">Supprimer {user.displayName}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            {user.displayName} ({user.email}) sera définitivement supprimé. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
