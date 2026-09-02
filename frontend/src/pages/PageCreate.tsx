import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { EditorLayout } from '#components/PageEditor/EditorLayout'
import { FileUploadButton } from '#components/PageEditor/FileUploadButton'
import { MarkdownEditor, type MarkdownEditorHandle } from '#components/PageEditor/MarkdownEditor'
import { PageMetadataForm } from '#components/PageEditor/PageMetadataForm'
import { Button } from '#components/ui/button'
import { FormError } from '#components/FormError'
import { createPage, publishPage } from '#api/pages'
import { useEditorState } from '#hooks/useEditorState'
import { useFileUpload } from '#hooks/useFileUpload'
import { usePageTree } from '#hooks/usePageTree'
import { extractErrorMessage } from '#lib/api-errors'
import { findPathToNode } from '#utils/page-tree'
import { pageMetadataSchema, type PageMetadataFormValues } from '#schemas/page-metadata.schema'

export function PageCreate() {
  const navigate = useNavigate()
  const { tree, refresh } = usePageTree()
  const editor = useEditorState()
  const editorRef = useRef<MarkdownEditorHandle>(null)
  const handleImageUpload = useFileUpload(editorRef, undefined, 'image')
  const handleAttachmentUpload = useFileUpload(editorRef, undefined, 'attachment')
  const [pendingAction, setPendingAction] = useState<'draft' | 'publish' | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { control, setValue, watch, handleSubmit } = useForm<PageMetadataFormValues>({
    resolver: zodResolver(pageMetadataSchema),
    defaultValues: { title: '', slug: '', visibility: 'private', parentId: null },
  })

  function submitAs(action: 'draft' | 'publish') {
    return handleSubmit(async (values) => {
      setPendingAction(action)
      setSaveError(null)
      try {
        const created = await createPage({ ...values, content: editor.content })
        if (action === 'publish') {
          await publishPage(created.id, true)
        }
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
        setPendingAction(null)
      }
    })
  }

  function handleCancel() {
    if (editor.isDirty && !window.confirm('Abandonner cette page sans la créer ?')) {
      return
    }
    navigate('/')
  }

  return (
    <EditorLayout
      backTo="/"
      title="Nouvelle page"
      actions={
        <>
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={submitAs('draft')}
            disabled={pendingAction !== null}
          >
            {pendingAction === 'draft' ? 'Enregistrement...' : 'Enregistrer le brouillon'}
          </Button>
          <Button type="button" onClick={submitAs('publish')} disabled={pendingAction !== null}>
            {pendingAction === 'publish' ? 'Publication...' : 'Publier'}
          </Button>
        </>
      }
      sidebar={
        <>
          <PageMetadataForm mode="create" control={control} setValue={setValue} watch={watch} />
          <FormError message={saveError} />
        </>
      }
    >
      <MarkdownEditor
        ref={editorRef}
        value={editor.content}
        onChange={editor.setContent}
        onSave={submitAs('draft')}
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
