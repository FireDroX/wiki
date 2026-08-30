import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '#components/layout/Sidebar'
import { Topbar } from '#components/layout/Topbar'

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-svh">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileOpenChange={setMobileSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
