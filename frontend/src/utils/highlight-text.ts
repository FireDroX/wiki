export interface TextPart {
  value: string
  matched: boolean
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function splitByMatch(text: string, query: string): TextPart[] {
  const trimmed = query.trim()
  if (!trimmed) {
    return [{ value: text, matched: false }]
  }

  const pattern = new RegExp(`(${escapeRegExp(trimmed)})`, 'ig')
  return text
    .split(pattern)
    .filter((part) => part.length > 0)
    .map((part) => ({ value: part, matched: part.toLowerCase() === trimmed.toLowerCase() }))
}
