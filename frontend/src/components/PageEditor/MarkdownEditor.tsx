import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Eye, Pencil } from 'lucide-react'
import { MarkdownRenderer } from '#components/MarkdownRenderer'
import { Button } from '#components/ui/button'
import { Textarea } from '#components/ui/textarea'
import { useDebouncedValue } from '#hooks/useDebouncedValue'
import { cn } from '#lib/utils'

const PREVIEW_DEBOUNCE_MS = 200

export interface MarkdownEditorHandle {
  insertAtCursor: (text: string) => void
  replaceText: (search: string, replacement: string) => void
}

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  toolbar?: ReactNode
  onFilesDropped?: (files: FileList) => void
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, onChange, onSave, toolbar, onFilesDropped }, ref) {
    const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const debouncedValue = useDebouncedValue(value, PREVIEW_DEBOUNCE_MS)

    useImperativeHandle(
      ref,
      () => ({
        insertAtCursor(text: string) {
          const textarea = textareaRef.current
          const start = textarea?.selectionStart ?? value.length
          const end = textarea?.selectionEnd ?? value.length
          onChange(value.slice(0, start) + text + value.slice(end))
          requestAnimationFrame(() => {
            const cursor = start + text.length
            textarea?.focus()
            textarea?.setSelectionRange(cursor, cursor)
          })
        },
        replaceText(search: string, replacement: string) {
          onChange(value.replace(search, replacement))
        },
      }),
      [value, onChange],
    )

    useEffect(() => {
      function handleKeyDown(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault()
          onSave()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onSave])

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
      event.preventDefault()
      setIsDraggingOver(false)
      if (event.dataTransfer.files.length > 0) {
        onFilesDropped?.(event.dataTransfer.files)
      }
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
          <div className="flex items-center gap-1 lg:hidden">
            <Button
              type="button"
              variant={mobileView === 'edit' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMobileView('edit')}
            >
              <Pencil /> Édition
            </Button>
            <Button
              type="button"
              variant={mobileView === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMobileView('preview')}
            >
              <Eye /> Aperçu
            </Button>
          </div>
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
        <div className="grid min-h-0 flex-1 gap-4 pt-4 lg:grid-cols-2">
          <div
            className={cn(
              'relative lg:block',
              mobileView === 'preview' && 'hidden',
              isDraggingOver && 'rounded-lg ring-2 ring-primary',
            )}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDraggingOver(true)
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Rédigez votre contenu en markdown, ou glissez-déposez une image..."
              className="field-sizing-fixed min-h-[60vh] resize-none font-mono text-sm"
            />
          </div>
          <div
            className={cn(
              'min-h-[60vh] overflow-y-auto rounded-lg border border-border p-4 lg:block',
              mobileView === 'edit' && 'hidden',
            )}
          >
            <MarkdownRenderer content={debouncedValue} />
          </div>
        </div>
      </div>
    )
  },
)
