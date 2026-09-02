import { useCallback, type RefObject } from 'react'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import type { MarkdownEditorHandle } from '#components/PageEditor/MarkdownEditor'
import type { FileUploadVariant } from '#components/PageEditor/FileUploadButton'
import { uploadFile } from '#api/media'
import { extractErrorMessage } from '#lib/api-errors'

function uploadErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 413) {
    return 'Fichier trop volumineux (max 20 Mo)'
  }
  if (isAxiosError(error) && error.response?.status === 415) {
    return 'Type de fichier non supporté'
  }
  return extractErrorMessage(error, "Échec de l'upload du fichier.")
}

export function useFileUpload(
  editorRef: RefObject<MarkdownEditorHandle | null>,
  pageId?: string,
  variant: FileUploadVariant = 'image',
) {
  return useCallback(
    async (files: FileList) => {
      const file = files[0]
      if (!file) {
        return
      }

      const placeholder = `${variant === 'image' ? '!' : ''}[Envoi de ${file.name}...]()`
      editorRef.current?.insertAtCursor(placeholder)

      try {
        const attachment = await uploadFile(file, pageId)
        const markdown = `${variant === 'image' ? '!' : ''}[${attachment.filename}](${attachment.url})`
        editorRef.current?.replaceText(placeholder, markdown)
      } catch (error) {
        editorRef.current?.replaceText(placeholder, '')
        toast.error(uploadErrorMessage(error))
      }
    },
    [editorRef, pageId, variant],
  )
}
