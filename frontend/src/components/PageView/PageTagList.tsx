import { Badge } from '#components/ui/badge'
import type { TagSummary } from '#api/tags'

interface PageTagListProps {
  tags: TagSummary[]
}

export function PageTagList({ tags }: PageTagListProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className="uppercase"
          style={{ borderColor: tag.color, color: tag.color }}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  )
}
