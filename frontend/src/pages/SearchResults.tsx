import { useSearchParams } from 'react-router'
import { Search } from 'lucide-react'
import { Button } from '#components/ui/button'
import { Skeleton } from '#components/ui/skeleton'
import { SearchResultsList } from '#components/SearchResults/SearchResultsList'
import { SEARCH_RESULTS_LIMIT, useSearchResults } from '#hooks/useSearchResults'

function parsePage(raw: string | null): number {
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const page = parsePage(searchParams.get('page'))
  const { status, items, total } = useSearchResults(q, page)
  const trimmed = q.trim()
  const totalPages = Math.max(1, Math.ceil(total / SEARCH_RESULTS_LIMIT))

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">Résultats de recherche</h1>
        {trimmed.length >= 2 && (
          <p className="text-sm text-muted-foreground">
            {total} résultat{total > 1 ? 's' : ''} pour « {trimmed} »
          </p>
        )}
      </div>

      {trimmed.length < 2 && (
        <p className="text-sm text-muted-foreground">Tapez au moins 2 caractères pour rechercher.</p>
      )}

      {status === 'loading' && items.length === 0 && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {status === 'error' && <p className="text-sm text-destructive">Impossible d'effectuer la recherche.</p>}

      {status === 'success' && items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <Search className="size-8" />
          <p>Aucun résultat pour « {trimmed} ».</p>
        </div>
      )}

      {items.length > 0 && <SearchResultsList results={items} query={trimmed} />}

      {total > SEARCH_RESULTS_LIMIT && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            Précédent
          </Button>
          <span>
            Page {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}
