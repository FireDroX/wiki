import type { DiffChange } from '#api/versions'

interface VersionDiffViewProps {
  changes: DiffChange[]
}

function gutterSymbol(type: DiffChange['type']): string {
  if (type === 'added') return '+'
  if (type === 'removed') return '−'
  return ''
}

function lineClasses(type: DiffChange['type']): string {
  if (type === 'added') return 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
  if (type === 'removed') return 'bg-red-500/10 text-red-800 dark:text-red-300'
  return 'text-foreground'
}

export function VersionDiffView({ changes }: VersionDiffViewProps) {
  const lines = changes.flatMap((change, changeIndex) =>
    change.value
      .split('\n')
      .filter((line, lineIndex, all) => !(lineIndex === all.length - 1 && line === ''))
      .map((line, lineIndex) => ({
        key: `${changeIndex}-${lineIndex}`,
        type: change.type,
        text: line,
      })),
  )

  return (
    <div className="overflow-x-auto rounded-md border border-border font-mono text-xs">
      {lines.map((line) => (
        <div key={line.key} className={`flex ${lineClasses(line.type)}`}>
          <span className="w-6 shrink-0 select-none border-r border-border/60 py-0.5 text-center text-muted-foreground">
            {gutterSymbol(line.type)}
          </span>
          <span className="min-w-0 flex-1 py-0.5 pr-3 pl-3 whitespace-pre-wrap">{line.text || ' '}</span>
        </div>
      ))}
    </div>
  )
}
