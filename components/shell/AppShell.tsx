'use client'

import { Suspense } from 'react'
import { AppRail } from './AppRail'
import { TopBar } from './TopBar'

// GHL-style shell: left icon-rail + top bar, shared across all modules.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden bg-mesh-light dark:bg-mesh-dark">
      <Suspense fallback={<div className="w-[64px] shrink-0" style={{ background: '#024C27' }} />}>
        <AppRail />
      </Suspense>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Suspense fallback={<div className="h-14 shrink-0 glass border-b" />}>
          <TopBar />
        </Suspense>
        <div className="flex-1 overflow-hidden min-h-0">{children}</div>
      </div>
    </div>
  )
}
