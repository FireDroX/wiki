import { useRef } from 'react'
import { ImagePlus } from 'lucide-react'
import { Button } from '#components/ui/button'

interface ImageUploadButtonProps {
  onFilesSelected: (files: FileList) => void
  disabled?: boolean
}

export function ImageUploadButton({ onFilesSelected, disabled }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus /> Image
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
