import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { ImageUploadButton } from '#components/PageEditor/ImageUploadButton'
import { MarkdownEditor, type MarkdownEditorHandle } from '#components/PageEditor/MarkdownEditor'
import { PageBreadcrumb } from '#components/layout/PageBreadcrumb'
import { Button } from '#components/ui/button'
import { FormError } from '#components/FormError'
import { Input } from '#components/ui/input'
import { Skeleton } from '#components/ui/skeleton'
import { uploadFile } from '#api/media'
import { updatePage } from '#api/pages'
import { useEditorState } from '#hooks/useEditorState'
import { usePage } from '#hooks/usePage'
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

function pathFromParam(param: string | undefined): string[] {
  return (param ?? '').split('/').filter(Boolean)
}

function PageEditorSkeleton() {
  return (
    <div className="max-w-3xl space-y-6 p-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export function PageEditor() {
  const params = useParams()
  const navigate = useNavigate()
  const pathSegments = pathFromParam(params['*'])
  const returnPath = `/pages/${pathSegments.join('/')}`
  const { status, page } = usePage(pathSegments)
  const editor = useEditorState()
  const editorRef = useRef<MarkdownEditorHandle>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (page) {
      editor.reset(page.title, page.content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function handleSave() {
    if (!page || isSaving) {
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      await updatePage(page.id, { title: editor.title, content: editor.content })
      editor.markSaved()
      navigate(returnPath)
    } catch (error) {
      setSaveError(extractErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleFiles(files: FileList) {
    const file = files[0]
    if (!file) {
      return
    }

    const placeholder = `![Uploading ${file.name}...]()`
    editorRef.current?.insertAtCursor(placeholder)

    try {
      const attachment = await uploadFile(file, page?.id)
      editorRef.current?.replaceText(placeholder, `![${attachment.filename}](${attachment.url})`)
    } catch (error) {
      editorRef.current?.replaceText(placeholder, '')
      toast.error(uploadErrorMessage(error))
    }
  }

  function handleCancel() {
    if (editor.isDirty && !window.confirm('Abandonner les modifications non sauvegardées ?')) {
      return
    }
    navigate(returnPath)
  }

  if (status === 'loading') {
    return <PageEditorSkeleton />
  }

  if (status !== 'success' || !page) {
    return (
      <div className="max-w-3xl space-y-4 p-8">
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-muted-foreground">Impossible de charger cette page pour édition.</p>
        <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <PageBreadcrumb title={page.title} parentId={page.parentId} />
          <Input
            value={editor.title}
            onChange={(event) => editor.setTitle(event.target.value)}
            placeholder="Titre de la page"
            className="h-10 max-w-md text-lg font-semibold"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
      <FormError message={saveError} />
      <MarkdownEditor
        ref={editorRef}
        value={editor.content}
        onChange={editor.setContent}
        onSave={handleSave}
        onFilesDropped={handleFiles}
        toolbar={<ImageUploadButton onFilesSelected={handleFiles} />}
      />
    </div>
  )
}
