import { Link } from 'react-router'
import type { SearchResult } from '#api/search'
import { usePageTree } from '#hooks/usePageTree'
import { buildPagePath } from '#utils/page-tree'
import { splitByMatch } from '#utils/highlight-text'

interface SearchResultsListProps {
  results: SearchResult[]
  query: string
}

interface HighlightedProps {
  text: string
  query: string
}

function Highlighted({ text, query }: HighlightedProps) {
  return (
    <>
      {splitByMatch(text, query).map((part, index) =>
        part.matched ? (
          <mark key={index} className="rounded-sm bg-primary/20 text-foreground">
            {part.value}
          </mark>
        ) : (
          <span key={index}>{part.value}</span>
        ),
      )}
    </>
  )
}

export function SearchResultsList({ results, query }: SearchResultsListProps) {
  const { tree } = usePageTree()

  return (
    <ul className="flex flex-col divide-y divide-border">
      {results.map((result) => {
        const path = buildPagePath(tree, result.pageId) ?? [result.slug]
        return (
          <li key={result.pageId} className="py-4">
            <Link to={`/pages/${path.join('/')}`} className="block space-y-1 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <h2 className="text-base font-medium text-foreground hover:underline">
                <Highlighted text={result.title} query={query} />
              </h2>
              <p className="text-sm text-muted-foreground">
                <Highlighted text={result.excerpt} query={query} />
              </p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
