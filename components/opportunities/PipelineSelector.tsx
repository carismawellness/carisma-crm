'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, GitBranch } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Pipeline } from '@/hooks/usePipelines'

interface Props {
  pipelines: Pipeline[]
  selectedPipelineId: string | null
  onSelect: (pipelineId: string) => void
}

// Pipeline display names aren't mirrored — label them positionally.
function pipelineLabel(index: number): string {
  return `Pipeline ${index + 1}`
}

export function PipelineSelector({ pipelines, selectedPipelineId, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (pipelines.length === 0) return null

  const selectedIdx = Math.max(
    0,
    pipelines.findIndex(p => p.pipelineId === selectedPipelineId)
  )

  // A single pipeline needs no dropdown — render a static label.
  if (pipelines.length === 1) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(2,76,39,0.06)', border: '1px solid rgba(40,55,44,0.10)' }}
      >
        <GitBranch className="w-3.5 h-3.5" style={{ color: '#4f7256' }} />
        <span
          className="text-[11px] uppercase"
          style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1px', color: '#4f7256', fontWeight: 700 }}
        >
          {pipelineLabel(0)}
        </span>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors"
        style={{ background: 'rgba(2,76,39,0.06)', border: '1px solid rgba(40,55,44,0.10)' }}
      >
        <GitBranch className="w-3.5 h-3.5" style={{ color: '#4f7256' }} />
        <span
          className="text-[11px] uppercase"
          style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1px', color: '#4f7256', fontWeight: 700 }}
        >
          {pipelineLabel(selectedIdx)}
        </span>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform"
          style={{ color: '#8eb093', transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full mt-1.5 z-20 min-w-[160px] rounded-2xl overflow-hidden glass"
            style={{ border: '1px solid rgba(40,55,44,0.12)', boxShadow: '0 8px 24px rgba(40,55,44,0.14)' }}
          >
            {pipelines.map((p, i) => {
              const active = (selectedPipelineId ?? pipelines[0].pipelineId) === p.pipelineId
              return (
                <button
                  key={p.pipelineId}
                  onClick={() => {
                    onSelect(p.pipelineId)
                    setOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] uppercase transition-colors flex items-center justify-between gap-2"
                  style={{
                    fontFamily: "'Novecento Wide', sans-serif",
                    letterSpacing: '1px',
                    color: active ? '#024C27' : '#5a4f43',
                    fontWeight: active ? 700 : 500,
                    background: active ? 'rgba(2,76,39,0.07)' : undefined,
                  }}
                >
                  {pipelineLabel(i)}
                  <span className="text-[10px]" style={{ color: '#8eb093' }}>
                    {p.stages.length} stages
                  </span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
