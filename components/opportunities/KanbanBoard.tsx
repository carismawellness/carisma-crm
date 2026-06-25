'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { useLeads } from '@/hooks/useLeads'
import type { PipelineStage, LeadWithContact } from '@/types'
import type { BrandId } from '@/lib/constants'
import { KanbanColumn } from './KanbanColumn'
import { OpportunityCard } from './OpportunityCard'

interface Props {
  brandId: BrandId
  stages: PipelineStage[]
  onOpen: (leadId: string) => void
}

export function KanbanBoard({ brandId, stages, onOpen }: Props) {
  const { leads, loading, refetch } = useLeads({ brandId, status: 'open' })

  // Local mirror so drag moves are optimistic; re-seeded whenever the source changes.
  const [items, setItems] = useState<LeadWithContact[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setItems(leads)
  }, [leads])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const stageIds = useMemo(() => new Set(stages.map(s => s.id)), [stages])

  // Group leads into columns. Unmatched stage_id (or stage from another
  // pipeline) falls into the first column. KEY: lead.stage_id === stage.id.
  const byStage = useMemo(() => {
    const map = new Map<string, LeadWithContact[]>()
    for (const stage of stages) map.set(stage.id, [])
    const firstId = stages[0]?.id
    for (const lead of items) {
      const key = lead.stage_id && stageIds.has(lead.stage_id) ? lead.stage_id : firstId
      if (key && map.has(key)) map.get(key)!.push(lead)
    }
    return map
  }, [items, stages, stageIds])

  const activeLead = activeId ? items.find(l => l.id === activeId) ?? null : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const leadId = String(active.id)
    const lead = items.find(l => l.id === leadId)
    if (!lead) return

    // `over.id` is either a column (stage.id) or another card (lead.id).
    const overId = String(over.id)
    let targetStageId: string | null = null
    if (stageIds.has(overId)) {
      targetStageId = overId
    } else {
      const overLead = items.find(l => l.id === overId)
      targetStageId = overLead?.stage_id ?? null
    }
    if (!targetStageId || targetStageId === lead.stage_id) return

    const prevStageId = lead.stage_id
    const targetStage = stages.find(s => s.id === targetStageId)

    // Optimistic move.
    setItems(prev =>
      prev.map(l => (l.id === leadId ? { ...l, stage_id: targetStageId, stage: targetStage ?? l.stage } : l))
    )

    try {
      const res = await fetch(`/api/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: targetStageId }),
      })
      if (!res.ok) throw new Error('stage update failed')
      toast.success(`Moved to ${targetStage?.name ?? 'stage'}`)
      refetch()
    } catch {
      // Roll back.
      setItems(prev =>
        prev.map(l => (l.id === leadId ? { ...l, stage_id: prevStageId, stage: lead.stage } : l))
      )
      toast.error('Could not move card. Reverted.')
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex-1 flex gap-3 overflow-x-auto scrollbar-thin p-4">
        {stages.map(stage => (
          <div
            key={stage.id}
            className="w-72 shrink-0 rounded-2xl animate-pulse"
            style={{ background: '#f0f3ee', border: '1px solid rgba(40,55,44,0.08)', minHeight: 220 }}
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex gap-3 overflow-x-auto scrollbar-thin p-4 items-stretch">
        {stages.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={byStage.get(stage.id) ?? []}
            onOpen={onOpen}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? <OpportunityCard lead={activeLead} onOpen={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
