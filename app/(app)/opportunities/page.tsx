'use client'

import { Suspense } from 'react'

// Phase 2 (Task 3) implements the Kanban board + pipeline selector + list toggle.
function OpportunitiesInner() {
  return (
    <div className="h-full flex items-center justify-center text-muted-foreground/50 text-sm">
      Opportunities board — coming up next
    </div>
  )
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={null}>
      <OpportunitiesInner />
    </Suspense>
  )
}
