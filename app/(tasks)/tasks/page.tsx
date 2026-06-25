'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopNav } from '@/components/inbox/TopNav'
import { TaskSidebar } from '@/components/tasks/TaskSidebar'
import { LeadQueue } from '@/components/tasks/LeadQueue'
import { LeadDetailPane } from '@/components/tasks/LeadDetailPane'
import { BRANDS } from '@/lib/constants'
import type { BrandId } from '@/lib/constants'

function TasksBoard() {
  const searchParams = useSearchParams()
  const brandParam = searchParams.get('brand')
  const initialBrand =
    brandParam && brandParam in BRANDS ? (brandParam as BrandId) : null

  const [selectedBrand, setSelectedBrand] = useState<BrandId | null>(initialBrand)
  const [selectedStatus, setSelectedStatus] = useState<string>('open')
  const [ownerFilter, setOwnerFilter] = useState<'me' | 'all'>('all')
  const [temperature, setTemperature] = useState<string | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-mesh-light dark:bg-mesh-dark">
      <TopNav
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
      />
      <div className="flex flex-1 overflow-hidden">
        <TaskSidebar
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          ownerFilter={ownerFilter}
          onOwnerChange={setOwnerFilter}
          temperature={temperature}
          onTemperatureChange={setTemperature}
        />
        <LeadQueue
          brandId={selectedBrand}
          status={selectedStatus}
          ownerFilter={ownerFilter}
          temperature={temperature}
          selectedId={selectedLeadId}
          onSelect={setSelectedLeadId}
        />
        <LeadDetailPane
          leadId={selectedLeadId}
          onLeadClosed={() => setSelectedLeadId(null)}
        />
      </div>
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksBoard />
    </Suspense>
  )
}
