import { Button } from '#components/ui/button'
import { cn } from '#lib/utils'

export function Home() {
  return (
    <main className={cn('home-page', 'flex flex-col items-start gap-4 p-8')}>
      <h1 className="text-2xl font-semibold">OpenWiki</h1>
      <Button>Get started</Button>
    </main>
  )
}
