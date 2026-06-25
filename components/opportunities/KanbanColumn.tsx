'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { PipelineStage, LeadWithContact } from '@/types'
import { OpportunityCard } from './OpportunityCard'

interface Props {
  stage: PipelineStage
  leads: LeadWithContact[]
  onOpen: (leadId: string) => void
}

function fmtEuro(value: number): string {
  return new Intl.NumberFormat('en-MT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function KanbanColumn({ stage, leads, onOpen }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  const total = leads.reduce((sum, l) => sum + (l.monetary_value || 0), 0)
  const wonish = stage.is_won

  return (
    <div
      className="w-72 shrink-0 flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: wonish ? 'rgba(201,216,193,0.30)' : '#f7f9f6',
        border: `1px solid ${wonish ? 'rgba(2,76,39,0.18)' : 'rgba(40,55,44,0.10)'}`,
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2.5 shrink-0 flex items-center justify-between gap-2"
        style={{
          borderBottom: '1px solid rgba(40,55,44,0.08)',
          borderTop: `2px solid ${wonish ? '#024C27' : 'rgba(79,114,86,0.4)'}`,
        }}
      >
        <span
          className="text-[11px] uppercase truncate"
          style={{
            fontFamily: "'Novecento Wide', sans-serif",
            letterSpacing: '1.2px',
            color: wonish ? '#024C27' : '#4f7256',
            fontWeight: 700,
          }}
        >
          {stage.name}
        </span>
        <span
          className="text-[10px] shrink-0 px-1.5 py-0.5 rounded-full font-bold"
          style={{
            background: 'rgba(2,76,39,0.08)',
            color: '#4f7256',
            fontFamily: "'Novecento Wide', sans-serif",
          }}
        >
          {leads.length}
        </span>
      </div>

      {/* Sub-header: pipeline value for the column */}
      {total > 0 && (
        <div className="px-3 py-1 shrink-0" style={{ borderBottom: '1px solid rgba(40,55,44,0.06)' }}>
          <span className="text-[10px] font-mono" style={{ color: '#8eb093' }}>
            {fmtEuro(total)}
          </span>
        </div>
      )}

      {/* Card list (droppable) */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2 transition-colors"
        style={{ background: isOver ? 'rgba(2,76,39,0.05)' : undefined, minHeight: 80 }}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.length === 0 ? (
            <div
              className="h-20 rounded-xl flex items-center justify-center text-center"
              style={{ border: '1px dashed rgba(40,55,44,0.14)' }}
            >
              <span
                className="text-[10px] uppercase"
                style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1.5px', color: '#b9c9b3' }}
              >
                Empty
              </span>
            </div>
          ) : (
            leads.map(lead => (
              <OpportunityCard key={lead.id} lead={lead} onOpen={onOpen} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
