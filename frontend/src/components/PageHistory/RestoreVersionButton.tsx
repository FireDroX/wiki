import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
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
  const [isRestoring, setIsRestoring] = useState(false)

  async function handleRestore() {
    setIsRestoring(true)
    try {
      await restoreVersion(pageId, versionId)
      toast.success('Version restaurée.')
      onRestored()
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la restauration.'))
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" disabled={isRestoring}>
          <RotateCcw />
          <span className="sr-only">Restaurer cette version</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restaurer cette version ?</AlertDialogTitle>
          <AlertDialogDescription>
            Restaurer cette version créera une nouvelle entrée dans l'historique. Continuer ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore}>Restaurer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
