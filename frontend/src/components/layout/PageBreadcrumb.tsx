import { Fragment } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
            <Link to="/">{t('common.home')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {ancestors.map((ancestor, index) => {
          const path = ancestors
            .slice(0, index + 1)
            .map((node) => node.slug)
            .join('/')
          return (
            <Fragment key={ancestor.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/pages/${path}`}>{ancestor.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          )
        })}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
