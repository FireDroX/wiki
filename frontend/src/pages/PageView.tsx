import { Link, useParams } from 'react-router'
import { useMemo } from 'react'
import { Button } from '#components/ui/button'
import { MarkdownRenderer } from '#components/MarkdownRenderer'
import { Skeleton } from '#components/ui/skeleton'
import { PageBreadcrumb } from '#components/layout/PageBreadcrumb'
import { usePage } from '#hooks/usePage'

function PageViewSkeleton() {
  return (
    <div className="max-w-3xl space-y-6 p-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-2/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

interface PageStatusMessageProps {
  title: string
  description: string
}

function PageStatusMessage({ title, description }: PageStatusMessageProps) {
  return (
    <div className="flex max-w-3xl flex-col items-start gap-4 p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Button asChild>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}

export function PageView() {
  const params = useParams()
  const pathSegments = useMemo(() => (params['*'] ?? '').split('/').filter(Boolean), [params])
  const { status, page } = usePage(pathSegments)

  if (status === 'loading') {
    return <PageViewSkeleton />
  }

  if (status === 'notFound') {
    return (
      <PageStatusMessage
        title="Page introuvable"
        description="Cette page n'existe pas ou a été supprimée."
      />
    )
  }

  if (status === 'forbidden') {
    return (
      <PageStatusMessage
        title="Accès refusé"
        description="Vous n'avez pas les droits nécessaires pour consulter cette page."
      />
    )
  }

  if (status === 'error' || !page) {
    return (
      <PageStatusMessage
        title="Une erreur est survenue"
        description="Impossible de charger cette page pour le moment."
      />
    )
  }

  return (
    <article className="max-w-3xl space-y-6 p-8">
      <PageBreadcrumb title={page.title} parentId={page.parentId} />
      <MarkdownRenderer content={page.content} />
    </article>
  )
}
