import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { diffVersions, type DiffChange } from '#api/versions'
import { Button } from '#components/ui/button'
import { Skeleton } from '#components/ui/skeleton'
import { VersionDiffView } from '#components/PageHistory/VersionDiffView'
import { VersionHistoryTable } from '#components/PageHistory/VersionHistoryTable'
import { useAuth } from '#hooks/useAuth'
import { usePage } from '#hooks/usePage'
import { useVersions } from '#hooks/useVersions'
import { formatDateTime } from '#utils/relative-time'

function pathFromParam(param: string | undefined): string[] {
  return (param ?? '').split('/').filter(Boolean)
}

export function PageHistory() {
  const params = useParams()
  const pathSegments = pathFromParam(params['*'])
  const { status, page } = usePage(pathSegments)
  const { user } = useAuth()
  const versions = useVersions(page?.id)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [diffChanges, setDiffChanges] = useState<DiffChange[] | null>(null)
  const [diffStatus, setDiffStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const selectedVersions = useMemo(
    () =>
      selectedIds
        .map((id) => versions.items.find((version) => version.id === id))
        .filter((version): version is NonNullable<typeof version> => !!version)
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
    [selectedIds, versions.items],
  )

  function toggleSelected(versionId: string) {
    setSelectedIds((previous) => {
      if (previous.includes(versionId)) {
        return previous.filter((id) => id !== versionId)
      }
      if (previous.length >= 2) {
        return [...previous.slice(1), versionId]
      }
      return [...previous, versionId]
    })
  }

  useEffect(() => {
    if (!page || selectedVersions.length !== 2) {
      setDiffChanges(null)
      setDiffStatus('idle')
      return
    }

    let cancelled = false
    setDiffStatus('loading')

    diffVersions(page.id, selectedVersions[0].id, selectedVersions[1].id)
      .then((result) => {
        if (cancelled) return
        setDiffChanges(result.changes)
        setDiffStatus('idle')
      })
      .catch(() => {
        if (cancelled) return
        setDiffStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [page, selectedVersions])

  if (status === 'loading') {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (status !== 'success' || !page) {
    return (
      <div className="space-y-4 p-8">
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-muted-foreground">Impossible de charger l'historique de cette page.</p>
        <Button asChild>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    )
  }

  const returnPath = `/pages/${pathSegments.join('/')}`

  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={returnPath}>
            <ArrowLeft />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Historique des versions</h1>
          <p className="text-sm text-muted-foreground">{page.title}</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex flex-col gap-3 lg:w-[480px] lg:shrink-0">
          {versions.status === 'loading' && versions.items.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <VersionHistoryTable
                pageId={page.id}
                versions={versions.items}
                currentUserId={user?.id}
                selectedIds={selectedIds}
                onToggleSelected={toggleSelected}
              />
              {versions.total > versions.limit && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={versions.page <= 1}
                    onClick={() => versions.setPage(versions.page - 1)}
                  >
                    Précédent
                  </Button>
                  <span>
                    Page {versions.page} / {Math.max(1, Math.ceil(versions.total / versions.limit))}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={versions.page * versions.limit >= versions.total}
                    onClick={() => versions.setPage(versions.page + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border bg-muted/20 p-4">
          {selectedVersions.length < 2 ? (
            <p className="text-sm text-muted-foreground">
              Sélectionnez deux versions dans la liste pour les comparer.
            </p>
          ) : (
            <div className="flex h-full flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{formatDateTime(selectedVersions[0].createdAt)}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{formatDateTime(selectedVersions[1].createdAt)}</span>
              </div>
              {diffStatus === 'loading' && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )}
              {diffStatus === 'error' && (
                <p className="text-sm text-destructive">Impossible de comparer ces deux versions.</p>
              )}
              {diffChanges && <VersionDiffView changes={diffChanges} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
