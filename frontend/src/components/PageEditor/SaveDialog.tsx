import { useState } from 'react'
import { Button } from '#components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#components/ui/dialog'
import { Field, FieldLabel } from '#components/ui/field'
import { Textarea } from '#components/ui/textarea'

interface SaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (changeSummary: string) => void
  isSaving?: boolean
}

export function SaveDialog({ open, onOpenChange, onConfirm, isSaving }: SaveDialogProps) {
  const [changeSummary, setChangeSummary] = useState('')

  function handleConfirm() {
    onConfirm(changeSummary)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setChangeSummary('')
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sauvegarder les modifications</DialogTitle>
          <DialogDescription>Décrivez brièvement votre modification (optionnel).</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="change-summary">Résumé de modification</FieldLabel>
          <Textarea
            id="change-summary"
            value={changeSummary}
            onChange={(event) => setChangeSummary(event.target.value)}
            placeholder="Décrivez votre modification..."
            rows={3}
          />
        </Field>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Annuler
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
