export function toInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]]
  return initials
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}
