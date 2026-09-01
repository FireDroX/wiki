import { Fragment } from 'react'
import { Link } from 'react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#components/ui/breadcrumb'
import { usePageAncestors } from '#hooks/usePageAncestors'

interface PageBreadcrumbProps {
  title: string
  parentId: string | null
}

export function PageBreadcrumb({ title, parentId }: PageBreadcrumbProps) {
  const ancestors = usePageAncestors(parentId)

  if (!parentId) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Accueil</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {ancestors.map((ancestor) => (
          <Fragment key={ancestor.id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/pages/${ancestor.slug}`}>{ancestor.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
