'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Compass } from 'lucide-react'
import type { BrandId } from '@/lib/constants'
import { usePipelines } from '@/hooks/usePipelines'
import { KanbanBoard } from '@/components/opportunities/KanbanBoard'
import { PipelineSelector } from '@/components/opportunities/PipelineSelector'
import { ViewToggle, type OpportunityView } from '@/components/opportunities/ViewToggle'
import { LeadQueue } from '@/components/tasks/LeadQueue'
import { LeadDetailPane } from '@/components/tasks/LeadDetailPane'

function LeadDrawer({ leadId, onClose }: { leadId: string | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {leadId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-30"
            style={{ background: 'rgba(40,55,44,0.18)' }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}
            className="absolute top-0 right-0 bottom-0 z-40 w-full max-w-[560px] flex flex-col overflow-hidden"
            style={{ background: '#fafaf8', borderLeft: '1px solid rgba(40,55,44,0.12)', boxShadow: '-8px 0 32px rgba(40,55,44,0.16)' }}
          >
            <div
              className="flex items-center justify-end px-3 py-2 shrink-0"
              style={{ borderBottom: '1px solid rgba(40,55,44,0.10)' }}
            >
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(40,55,44,0.06)' }}
                aria-label="Close"
              >
                <X className="w-4 h-4" style={{ color: '#4f7256' }} />
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <LeadDetailPane leadId={leadId} onLeadClosed={onClose} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function OpportunitiesInner() {
  const params = useSearchParams()
  const brand = (params.get('brand') as BrandId | null) ?? null

  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null)
  const [view, setView] = useState<OpportunityView>('board')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const { pipelines, stages, loading } = usePipelines(brand, selectedPipelineId)

  // No brand selected (All): boards are per-brand, so force the List view.
  const noBrand = brand === null
  const effectiveView: OpportunityView = noBrand ? 'list' : view

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5 shrink-0 flex-wrap"
        style={{ borderBottom: '1px solid rgba(40,55,44,0.10)', background: 'rgba(255,255,255,0.85)' }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="eyebrow text-[11px]"
            style={{ color: '#4f7256' }}
          >
            Opportunities
          </span>
          {!noBrand && pipelines.length > 0 && (
            <PipelineSelector
              pipelines={pipelines}
              selectedPipelineId={selectedPipelineId ?? pipelines[0]?.pipelineId ?? null}
              onSelect={setSelectedPipelineId}
            />
          )}
        </div>

        {noBrand ? (
          <span
            className="inline-flex items-center gap-1.5 text-[11px]"
            style={{ color: '#8eb093' }}
          >
            <Compass className="w-3.5 h-3.5" />
            Pick a brand to see the pipeline board
          </span>
        ) : (
          <ViewToggle view={view} onChange={setView} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {effectiveView === 'list' ? (
          <>
            <LeadQueue
              brandId={brand}
              status="open"
              ownerFilter="all"
              temperature={null}
              selectedId={selectedLeadId}
              onSelect={setSelectedLeadId}
            />
            <LeadDetailPane leadId={selectedLeadId} onLeadClosed={() => setSelectedLeadId(null)} />
          </>
        ) : loading && stages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span
              className="text-[11px] uppercase"
              style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2px', color: '#b9c9b3' }}
            >
              Loading pipeline…
            </span>
          </div>
        ) : stages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(2,76,39,0.06)' }}
            >
              <Compass className="w-6 h-6" style={{ color: '#8eb093' }} />
            </div>
            <p
              className="text-[12px] uppercase"
              style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1.5px', color: '#8eb093', fontWeight: 700 }}
            >
              No pipeline for this brand
            </p>
          </div>
        ) : (
          <KanbanBoard brandId={brand as BrandId} stages={stages} onOpen={setSelectedLeadId} />
        )}
      </div>

      {/* Board click → right-side slide-over drawer (not used in list view, which
          has its own inline detail pane). */}
      {effectiveView === 'board' && (
        <LeadDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      )}
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
