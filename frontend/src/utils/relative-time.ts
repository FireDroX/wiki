const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
]

const formatter = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })

export function formatRelativeTime(isoDate: string): string {
  const elapsedSeconds = (Date.parse(isoDate) - Date.now()) / 1000

  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(elapsedSeconds) >= secondsInUnit) {
      return formatter.format(Math.round(elapsedSeconds / secondsInUnit), unit)
    }
  }

  return formatter.format(Math.round(elapsedSeconds), 'second')
}

export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
