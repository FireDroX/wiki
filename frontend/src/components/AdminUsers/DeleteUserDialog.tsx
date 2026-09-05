import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled || pending}
          title={disabled ? t('admin.users.selfDeleteTooltip') : undefined}
        >
          <Trash2 />
          <span className="sr-only">{t('admin.users.deleteSr', { name: user.displayName })}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.users.deleteConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.users.deleteConfirmDescription', { name: user.displayName, email: user.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
