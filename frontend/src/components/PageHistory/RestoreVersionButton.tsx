import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
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
import { restoreVersion } from '#api/versions'
import { extractErrorMessage } from '#lib/api-errors'

interface RestoreVersionButtonProps {
  pageId: string
  versionId: string
  onRestored: () => void
}

export function RestoreVersionButton({ pageId, versionId, onRestored }: RestoreVersionButtonProps) {
  const { t } = useTranslation()
  const [isRestoring, setIsRestoring] = useState(false)

  async function handleRestore() {
    setIsRestoring(true)
    try {
      await restoreVersion(pageId, versionId)
      toast.success(t('pageHistory.restored'))
      onRestored()
    } catch (error) {
      toast.error(extractErrorMessage(error, t('pageHistory.restoreFailed')))
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" disabled={isRestoring}>
          <RotateCcw />
          <span className="sr-only">{t('pageHistory.restoreSr')}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('pageHistory.restoreConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('pageHistory.restoreConfirmDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore}>{t('pageHistory.restore')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
