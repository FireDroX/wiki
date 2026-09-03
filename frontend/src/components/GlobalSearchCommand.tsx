import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { FileText } from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '#components/ui/command'
import { useDebouncedSearch } from '#hooks/useDebouncedSearch'
import { usePageTree } from '#hooks/usePageTree'
import { buildPagePath } from '#utils/page-tree'
import type { SearchResult } from '#api/search'

export const GLOBAL_SEARCH_OPEN_EVENT = 'search:open'

const COMMAND_RESULT_LIMIT = 8
const MIN_QUERY_LENGTH = 2

export function GlobalSearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { tree } = usePageTree()
  const { status, results } = useDebouncedSearch(query, COMMAND_RESULT_LIMIT)

  useEffect(() => {
    function onKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    function onExternalOpen() {
      setOpen(true)
    }

    window.addEventListener('keydown', onKeydown)
    window.addEventListener(GLOBAL_SEARCH_OPEN_EVENT, onExternalOpen)
    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener(GLOBAL_SEARCH_OPEN_EVENT, onExternalOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  function goToResult(result: SearchResult) {
    const path = buildPagePath(tree, result.pageId) ?? [result.slug]
    setOpen(false)
    navigate(`/pages/${path.join('/')}`)
  }

  function goToAllResults() {
    const trimmed = query.trim()
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const trimmed = query.trim()
  const showTooShortHint = trimmed.length < MIN_QUERY_LENGTH
  const showNoResults = !showTooShortHint && status !== 'loading' && results.length === 0

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Rechercher"
      description="Rechercher une page dans le wiki"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Rechercher dans le wiki..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {showTooShortHint && <CommandEmpty>Tapez au moins 2 caractères.</CommandEmpty>}
          {showNoResults && <CommandEmpty>Aucun résultat pour « {trimmed} ».</CommandEmpty>}
          {results.length > 0 && (
            <CommandGroup heading="Pages">
              {results.map((result) => (
                <CommandItem
                  key={result.pageId}
                  value={result.pageId}
                  onSelect={() => goToResult(result)}
                >
                  <FileText className="text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{result.title}</span>
                    <span className="truncate text-xs text-muted-foreground">{result.excerpt}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {results.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem value="__view-all-results__" onSelect={goToAllResults}>
                  Voir tous les résultats pour « {trimmed} »
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
