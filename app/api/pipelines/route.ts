import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PipelineStage } from '@/types'

// Pipeline stages for a brand, grouped by pipeline (a brand can have several
// GHL pipelines, e.g. "Call Pipeline" + "Chat Pipeline"). Powers the Kanban.
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const brand = new URL(req.url).searchParams.get('brand')
  if (!brand) return NextResponse.json({ error: 'Missing brand' }, { status: 400 })

  const { data, error } = await supabase
    .from('crm_pipeline_stages')
    .select('*')
    .eq('brand_id', brand)
    .order('position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const byPipeline = new Map<string, PipelineStage[]>()
  for (const stage of (data ?? []) as PipelineStage[]) {
    const key = stage.pipeline_external_id
    if (!byPipeline.has(key)) byPipeline.set(key, [])
    byPipeline.get(key)!.push(stage)
  }

  // Pipeline display names aren't mirrored (only stage names); the UI labels
  // pipelines positionally. Order pipelines by their earliest stage position.
  const pipelines = [...byPipeline.entries()]
    .map(([pipelineId, stages]) => ({ pipelineId, stages }))
    .sort((a, b) => (a.stages[0]?.position ?? 0) - (b.stages[0]?.position ?? 0))

  return NextResponse.json({ pipelines })
}
