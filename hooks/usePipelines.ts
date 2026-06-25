'use client'

import { useEffect, useState, useMemo } from 'react'
import type { PipelineStage } from '@/types'
import type { BrandId } from '@/lib/constants'

export interface Pipeline {
  pipelineId: string
  stages: PipelineStage[]
}

/**
 * Fetches a brand's GHL pipelines (each = an ordered list of stages) for the
 * Kanban board. Pipeline names aren't mirrored, so callers label them
 * positionally ("Pipeline 1/2…"). Returns the pipelines plus a helper that
 * resolves the selected pipeline's ordered stages.
 */
export function usePipelines(brandId: BrandId | null, selectedPipelineId: string | null) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!brandId) {
      setPipelines([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetch(`/api/pipelines?brand=${brandId}`)
      .then(res => {
        if (!res.ok) return { pipelines: [] }
        return res.json()
      })
      .then(data => {
        if (cancelled) return
        setPipelines(Array.isArray(data?.pipelines) ? data.pipelines : [])
      })
      .catch(() => {
        if (!cancelled) setPipelines([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [brandId])

  // The selected pipeline's ordered stages (defaults to the first pipeline).
  const stages = useMemo<PipelineStage[]>(() => {
    if (pipelines.length === 0) return []
    const selected =
      pipelines.find(p => p.pipelineId === selectedPipelineId) ?? pipelines[0]
    return selected.stages
  }, [pipelines, selectedPipelineId])

  return { pipelines, stages, loading }
}
