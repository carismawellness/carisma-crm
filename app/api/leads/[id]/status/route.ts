import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getLeadProvider } from '@/lib/leads/provider'
import { awardXp } from '@/lib/leads/xp'
import { TASK_XP } from '@/lib/constants'
import type { BrandId } from '@/lib/constants'
import type { LeadStatus } from '@/types'

const VALID_STATUSES: LeadStatus[] = ['open', 'won', 'lost', 'abandoned']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: lead, error: leadError } = await service
    .from('crm_leads')
    .select('*')
    .eq('id', id)
    .single()
  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const brandId = lead.brand_id as BrandId

  // Write through to the source of truth.
  await getLeadProvider(brandId).setStatus(brandId, lead.external_id, status)

  const now = new Date().toISOString()
  const { error: updateError } = await service
    .from('crm_leads')
    .update({ status, updated_at: now, last_activity_at: now })
    .eq('id', id)
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await service.from('crm_lead_activities').insert({
    lead_id: id,
    agent_id: user.id,
    type: 'status_change',
    body: `Status set to ${status}`,
    metadata: { status },
  })

  if (status === 'won') {
    await awardXp(service, {
      agentId: user.id,
      eventType: 'lead_won',
      xp: TASK_XP.LEAD_WON,
      leadId: id,
    })
  }

  return NextResponse.json({ ok: true })
}
