'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PipelineStage } from '@/types'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  brandId: string
  pipelineExternalId: string | null
  currentStageId: string | null
  disabled?: boolean
  onAdvance: (stageId: string) => void
}

export function StageStepper({
  brandId,
  pipelineExternalId,
  currentStageId,
  disabled,
  onAdvance,
}: Props) {
  const [stages, setStages] = useState<PipelineStage[]>([])

  useEffect(() => {
    if (!pipelineExternalId) {
      setStages([])
      return
    }
    const supabase = createClient()
    supabase
      .from('crm_pipeline_stages')
      .select('*')
      .eq('brand_id', brandId)
      .eq('pipeline_external_id', pipelineExternalId)
      .order('position', { ascending: true })
      .then(({ data }) => setStages((data as PipelineStage[]) ?? []))
  }, [brandId, pipelineExternalId])

  if (stages.length === 0) return null

  const currentIdx = stages.findIndex(s => s.id === currentStageId)

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
      {stages.map((stage, i) => {
        const isDone = currentIdx >= 0 && i < currentIdx
        const isCurrent = i === currentIdx
        const isFuture = currentIdx >= 0 && i > currentIdx
        const clickable = !disabled && isFuture

        return (
          <div key={stage.id} className="flex items-center shrink-0">
            <motion.button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onAdvance(stage.id)}
              whileHover={clickable ? { scale: 1.04 } : undefined}
              whileTap={clickable ? { scale: 0.97 } : undefined}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] transition-all"
              style={{
                cursor: clickable ? 'pointer' : 'default',
                fontFamily: "'Novecento Wide', sans-serif",
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontWeight: isCurrent ? 700 : 500,
                background: isCurrent
                  ? '#024C27'
                  : isDone
                  ? 'rgba(2,76,39,0.10)'
                  : 'rgba(40,55,44,0.05)',
                color: isCurrent ? '#ffffff' : isDone ? '#4f7256' : '#8eb093',
                opacity: isFuture && !clickable ? 0.6 : 1,
              }}
              title={clickable ? `Advance to ${stage.name}` : stage.name}
            >
              {isDone && <Check className="w-2.5 h-2.5" />}
              <span className="truncate max-w-[90px]">{stage.name}</span>
            </motion.button>
            {i < stages.length - 1 && (
              <span
                className="w-3 h-px shrink-0"
                style={{ background: isDone ? 'rgba(2,76,39,0.3)' : 'rgba(40,55,44,0.15)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
