import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { awardXp } from '@/lib/leads/xp'
import { ensureAgent } from '@/lib/agents/ensure'
import { TASK_XP, LIGHTNING_THRESHOLD_MS } from '@/lib/constants'
import type { LeadActivityType } from '@/types'

const ALLOWED_TYPES: LeadActivityType[] = ['call', 'note']

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, body } = await req.json()
  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
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

  const now = new Date().toISOString()

  await service.from('crm_lead_activities').insert({
    lead_id: id,
    agent_id: user.id,
    type,
    body: body ?? null,
    metadata: {},
  })

  let xpEarned = 0
  const isFirstContact = !lead.first_contacted_at

  if (isFirstContact) {
    // Mark first contact + refresh activity timestamp.
    await service
      .from('crm_leads')
      .update({ first_contacted_at: now, last_activity_at: now, updated_at: now })
      .eq('id', id)

    xpEarned = speedToLeadXp(lead.external_created_at, lead.sla_due_at, Date.now())

    await awardXp(service, {
      agentId: user.id,
      eventType: 'speed_to_lead',
      xp: xpEarned,
      leadId: id,
    })
  } else {
    await service
      .from('crm_leads')
      .update({ last_activity_at: now, updated_at: now })
      .eq('id', id)
  }

  return NextResponse.json({ ok: true, xpEarned })
}

/**
 * Speed-to-lead XP on first contact:
 *  - within LIGHTNING_THRESHOLD_MS of lead creation -> LIGHTNING
 *  - else before sla_due_at -> FAST
 *  - else 0
 */
function speedToLeadXp(
  externalCreatedAt: string | null,
  slaDueAt: string | null,
  nowMs: number
): number {
  const created = externalCreatedAt ? Date.parse(externalCreatedAt) : NaN
  if (!Number.isNaN(created) && nowMs - created <= LIGHTNING_THRESHOLD_MS) {
    return TASK_XP.SPEED_TO_LEAD_LIGHTNING
  }
  const sla = slaDueAt ? Date.parse(slaDueAt) : NaN
  if (!Number.isNaN(sla) && nowMs <= sla) {
    return TASK_XP.SPEED_TO_LEAD_FAST
  }
  return 0
}
