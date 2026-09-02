import { useCallback, type RefObject } from 'react'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import type { MarkdownEditorHandle } from '#components/PageEditor/MarkdownEditor'
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

export function useImageUpload(editorRef: RefObject<MarkdownEditorHandle | null>, pageId?: string) {
  return useCallback(
    async (files: FileList) => {
      const file = files[0]
      if (!file) {
        return
      }

      const placeholder = `![Uploading ${file.name}...]()`
      editorRef.current?.insertAtCursor(placeholder)

      try {
        const attachment = await uploadFile(file, pageId)
        editorRef.current?.replaceText(placeholder, `![${attachment.filename}](${attachment.url})`)
      } catch (error) {
        editorRef.current?.replaceText(placeholder, '')
        toast.error(uploadErrorMessage(error))
      }
    },
    [editorRef, pageId],
  )
}
