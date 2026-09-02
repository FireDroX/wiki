import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { EditorLayout } from '#components/PageEditor/EditorLayout'
import { FileUploadButton } from '#components/PageEditor/FileUploadButton'
import { MarkdownEditor, type MarkdownEditorHandle } from '#components/PageEditor/MarkdownEditor'
import { PageMetadataForm } from '#components/PageEditor/PageMetadataForm'
import { Button } from '#components/ui/button'
import { Field, FieldLabel } from '#components/ui/field'
import { FormError } from '#components/FormError'
import { Skeleton } from '#components/ui/skeleton'
import { Textarea } from '#components/ui/textarea'
import { movePage, publishPage, updatePage } from '#api/pages'
import { useEditorState } from '#hooks/useEditorState'
import { useFileUpload } from '#hooks/useFileUpload'
import { usePage } from '#hooks/usePage'
import { usePageTree } from '#hooks/usePageTree'
import { extractErrorMessage } from '#lib/api-errors'
import { findPathToNode } from '#utils/page-tree'
import { pageMetadataSchema, type PageMetadataFormValues } from '#schemas/page-metadata.schema'

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
  const initialReturnPath = `/pages/${pathSegments.join('/')}`
  const { status, page } = usePage(pathSegments)
  const { tree, refresh } = usePageTree()
  const editor = useEditorState()
  const editorRef = useRef<MarkdownEditorHandle>(null)
  const handleImageUpload = useFileUpload(editorRef, page?.id, 'image')
  const handleAttachmentUpload = useFileUpload(editorRef, page?.id, 'attachment')
  const [changeSummary, setChangeSummary] = useState('')
  const [pendingAction, setPendingAction] = useState<'draft' | 'publish' | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [currentParentId, setCurrentParentId] = useState<string | null>(null)

  const { control, setValue, watch, getValues, reset } = useForm<PageMetadataFormValues>({
    resolver: zodResolver(pageMetadataSchema),
    defaultValues: { title: '', slug: '', visibility: 'private', parentId: null },
  })

  const returnPath = page
    ? (() => {
        const ancestors = currentParentId
          ? (findPathToNode(tree, (node) => node.id === currentParentId) ?? [])
          : []
        return `/pages/${[...ancestors.map((node) => node.slug), page.slug].join('/')}`
      })()
    : initialReturnPath

  useEffect(() => {
    if (page) {
      editor.reset(page.title, page.content)
      reset({ title: page.title, slug: page.slug, visibility: page.visibility, parentId: page.parentId })
      setCurrentParentId(page.parentId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function handleParentChange(newParentId: string | null) {
    if (!page) {
      return
    }
    try {
      await movePage(page.id, newParentId)
      await refresh()
      setCurrentParentId(newParentId)
      toast.success('Page déplacée.')
    } catch (error) {
      setValue('parentId', currentParentId)
      toast.error(extractErrorMessage(error, "Échec du déplacement de la page."))
    }
  }

  async function submitSave(action: 'draft' | 'publish') {
    if (!page || pendingAction) {
      return
    }
    setPendingAction(action)
    setSaveError(null)
    try {
      await updatePage(page.id, {
        title: getValues('title'),
        content: editor.content,
        changeSummary: changeSummary || undefined,
      })
      if (action === 'publish') {
        await publishPage(page.id, true)
      }
      editor.markSaved()
      toast.success(action === 'publish' ? 'Page publiée.' : 'Page sauvegardée.')
      navigate(returnPath)
    } catch (error) {
      setSaveError(extractErrorMessage(error))
    } finally {
      setPendingAction(null)
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
    <EditorLayout
      backTo={returnPath}
      title={`Modifier : ${page.title}`}
      actions={
        <>
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => submitSave('draft')}
            disabled={pendingAction !== null}
          >
            {pendingAction === 'draft' ? 'Enregistrement...' : 'Enregistrer le brouillon'}
          </Button>
          <Button type="button" onClick={() => submitSave('publish')} disabled={pendingAction !== null}>
            {pendingAction === 'publish' ? 'Publication...' : 'Publier'}
          </Button>
        </>
      }
      sidebar={
        <>
          <PageMetadataForm
            mode="edit"
            control={control}
            setValue={setValue}
            watch={watch}
            excludePageId={page.id}
            onParentChange={handleParentChange}
          />
          <Field className="mt-5">
            <FieldLabel htmlFor="change-summary">Résumé de la modification</FieldLabel>
            <Textarea
              id="change-summary"
              value={changeSummary}
              onChange={(event) => setChangeSummary(event.target.value)}
              placeholder="Décrivez votre modification..."
              rows={3}
            />
          </Field>
          <FormError message={saveError} />
        </>
      }
    >
      <MarkdownEditor
        ref={editorRef}
        value={editor.content}
        onChange={editor.setContent}
        onSave={() => submitSave('draft')}
        onFilesDropped={handleImageUpload}
        toolbarExtra={
          <>
            <FileUploadButton variant="image" onFilesSelected={handleImageUpload} />
            <FileUploadButton variant="attachment" onFilesSelected={handleAttachmentUpload} />
          </>
        }
      />
    </EditorLayout>
  )
}
