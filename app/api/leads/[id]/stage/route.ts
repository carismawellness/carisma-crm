import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getLeadProvider } from '@/lib/leads/provider'
import { awardXp } from '@/lib/leads/xp'
import { ensureAgent } from '@/lib/agents/ensure'
import { TASK_XP } from '@/lib/constants'
import type { BrandId } from '@/lib/constants'

const BOOKED_RE = /book/i

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stageId } = await req.json()
  if (!stageId) {
    return NextResponse.json({ error: 'Missing stageId' }, { status: 400 })
  }

  const service = createServiceClient()
  await ensureAgent(service, user)

  const { data: lead, error: leadError } = await service
    .from('crm_leads')
    .select('*')
    .eq('id', id)
    .single()
  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const { data: stage, error: stageError } = await service
    .from('crm_pipeline_stages')
    .select('*')
    .eq('id', stageId)
    .single()
  if (stageError || !stage) {
    return NextResponse.json({ error: 'Stage not found' }, { status: 404 })
  }

  const brandId = lead.brand_id as BrandId

  // Write through to the source of truth.
  await getLeadProvider(brandId).advanceStage(brandId, lead.external_id, stage.external_id)

  const now = new Date().toISOString()
  const { error: updateError } = await service
    .from('crm_leads')
    .update({ stage_id: stageId, updated_at: now, last_activity_at: now })
    .eq('id', id)
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await service.from('crm_lead_activities').insert({
    lead_id: id,
    agent_id: user.id,
    type: 'stage_change',
    body: `Moved to ${stage.name}`,
    metadata: { stage_id: stageId, stage_name: stage.name },
  })

  // Award XP when the lead enters a won or "booked" stage.
  const isBooked = stage.is_won === true || BOOKED_RE.test(stage.name)
  if (isBooked) {
    await awardXp(service, {
      agentId: user.id,
      eventType: 'lead_booked',
      xp: TASK_XP.LEAD_BOOKED,
      leadId: id,
    })
  }

  return NextResponse.json({ ok: true, lead: { ...lead, stage_id: stageId } })
}
