import { useRef } from 'react'
import { ImagePlus, Paperclip } from 'lucide-react'
import { Button } from '#components/ui/button'

export type FileUploadVariant = 'image' | 'attachment'

interface FileUploadButtonProps {
  variant: FileUploadVariant
  onFilesSelected: (files: FileList) => void
  disabled?: boolean
}

const VARIANT_CONFIG: Record<FileUploadVariant, { icon: typeof ImagePlus; accept: string; label: string }> = {
  image: { icon: ImagePlus, accept: 'image/*', label: 'Insérer une image' },
  attachment: { icon: Paperclip, accept: '*/*', label: 'Joindre un fichier' },
}

export function FileUploadButton({ variant, onFilesSelected, disabled }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { icon: Icon, accept, label } = VARIANT_CONFIG[variant]

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title={label}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Icon />
        <span className="sr-only">{label}</span>
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            onFilesSelected(event.target.files)
          }
          event.target.value = ''
        }}
      />
    </>
  )
}
