import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ImageUploadButton } from '#components/PageEditor/ImageUploadButton'
import { MarkdownEditor, type MarkdownEditorHandle } from '#components/PageEditor/MarkdownEditor'
import { SaveDialog } from '#components/PageEditor/SaveDialog'
import { PageBreadcrumb } from '#components/layout/PageBreadcrumb'
import { Button } from '#components/ui/button'
import { FormError } from '#components/FormError'
import { Input } from '#components/ui/input'
import { Skeleton } from '#components/ui/skeleton'
import { updatePage } from '#api/pages'
import { useEditorState } from '#hooks/useEditorState'
import { useImageUpload } from '#hooks/useImageUpload'
import { usePage } from '#hooks/usePage'
import { extractErrorMessage } from '#lib/api-errors'

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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  useEffect(() => {
    if (page) {
      editor.reset(page.title, page.content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  function openSaveDialog() {
    setSaveError(null)
    setSaveDialogOpen(true)
  }

  async function handleConfirmSave(changeSummary: string) {
    if (!page || isSaving) {
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      await updatePage(page.id, {
        title: editor.title,
        content: editor.content,
        changeSummary: changeSummary || undefined,
      })
      editor.markSaved()
      setSaveDialogOpen(false)
      toast.success('Page sauvegardée.')
      navigate(returnPath)
    } catch (error) {
      setSaveError(extractErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleFiles = useImageUpload(editorRef, page?.id)

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
          <Button type="button" onClick={openSaveDialog} disabled={isSaving}>
            Sauvegarder
          </Button>
        </div>
      </div>
      <FormError message={saveError} />
      <MarkdownEditor
        ref={editorRef}
        value={editor.content}
        onChange={editor.setContent}
        onSave={openSaveDialog}
        onFilesDropped={handleFiles}
        toolbar={<ImageUploadButton onFilesSelected={handleFiles} />}
      />
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onConfirm={handleConfirmSave}
        isSaving={isSaving}
      />
    </div>
  )
}
