import { useEffect, useState } from 'react'
import { Eye, Pencil } from 'lucide-react'
import { MarkdownRenderer } from '#components/MarkdownRenderer'
import { Button } from '#components/ui/button'
import { Textarea } from '#components/ui/textarea'
import { useDebouncedValue } from '#hooks/useDebouncedValue'
import { cn } from '#lib/utils'

const PREVIEW_DEBOUNCE_MS = 200

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
}

export function MarkdownEditor({ value, onChange, onSave }: MarkdownEditorProps) {
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
  const debouncedValue = useDebouncedValue(value, PREVIEW_DEBOUNCE_MS)

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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-1 border-b border-border pb-2 lg:hidden">
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
      <div className="grid min-h-0 flex-1 gap-4 pt-4 lg:grid-cols-2">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Rédigez votre contenu en markdown..."
          className={cn(
            'field-sizing-fixed min-h-[60vh] resize-none font-mono text-sm lg:block',
            mobileView === 'preview' && 'hidden',
          )}
        />
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
}
