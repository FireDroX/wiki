import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ImageUploadButton } from '#components/PageEditor/ImageUploadButton'
import { MarkdownEditor, type MarkdownEditorHandle } from '#components/PageEditor/MarkdownEditor'
import { PageMetadataForm } from '#components/PageEditor/PageMetadataForm'
import { Button } from '#components/ui/button'
import { FormError } from '#components/FormError'
import { createPage } from '#api/pages'
import { useEditorState } from '#hooks/useEditorState'
import { useImageUpload } from '#hooks/useImageUpload'
import { usePageTree } from '#hooks/usePageTree'
import { extractErrorMessage } from '#lib/api-errors'
import { findPathToNode } from '#utils/page-tree'
import { pageMetadataSchema, type PageMetadataFormValues } from '#schemas/page-metadata.schema'

export function PageCreate() {
  const navigate = useNavigate()
  const { tree, refresh } = usePageTree()
  const editor = useEditorState()
  const editorRef = useRef<MarkdownEditorHandle>(null)
  const handleFiles = useImageUpload(editorRef)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { control, setValue, watch, handleSubmit } = useForm<PageMetadataFormValues>({
    resolver: zodResolver(pageMetadataSchema),
    defaultValues: { title: '', slug: '', visibility: 'private', parentId: null },
  })

  async function onSubmit(values: PageMetadataFormValues) {
    setIsSaving(true)
    setSaveError(null)
    try {
      const created = await createPage({ ...values, content: editor.content })
      const ancestors = values.parentId
        ? (findPathToNode(tree, (node) => node.id === values.parentId) ?? [])
        : []
      const path = [...ancestors.map((node) => node.slug), created.slug].join('/')
      editor.markSaved()
      await refresh()
      navigate(`/pages/${path}`)
    } catch (error) {
      setSaveError(extractErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    if (editor.isDirty && !window.confirm('Abandonner cette page sans la créer ?')) {
      return
    }
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col gap-4 p-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Nouvelle page</h1>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </div>
      <FormError message={saveError} />
      <div className="max-w-md">
        <PageMetadataForm control={control} setValue={setValue} watch={watch} />
      </div>
      <MarkdownEditor
        ref={editorRef}
        value={editor.content}
        onChange={editor.setContent}
        onSave={handleSubmit(onSubmit)}
        onFilesDropped={handleFiles}
        toolbar={<ImageUploadButton onFilesSelected={handleFiles} />}
      />
    </form>
  )
}
