import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getLeadProvider } from '@/lib/leads/provider'
import { ensureAgent } from '@/lib/agents/ensure'
import type { BrandId } from '@/lib/constants'

// Agent -> provider user id mapping:
// crm_agents has no stored GHL/provider user id column yet, so we cannot
// derive the provider owner from the agent uuid alone. `agentId` (the
// crm_agents uuid we mirror locally) is required; `providerUserId` (the
// GHL user id) is optional. When it is present we also write through to
// the provider; when absent we only update the local mirror.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { agentId, providerUserId } = await req.json()
  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 })
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

  const brandId = lead.brand_id as BrandId

  // Write through to the source of truth only when we know the provider user id.
  if (providerUserId) {
    await getLeadProvider(brandId).assign(brandId, lead.external_id, providerUserId)
  }
  // TODO: map agent->GHL user id once crm_agents stores it

  const now = new Date().toISOString()
  const { error: updateError } = await service
    .from('crm_leads')
    .update({ assigned_agent_id: agentId, updated_at: now, last_activity_at: now })
    .eq('id', id)
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await service.from('crm_lead_activities').insert({
    lead_id: id,
    agent_id: user.id,
    type: 'assignment',
    body: 'Lead assigned',
    metadata: { assigned_agent_id: agentId, provider_user_id: providerUserId },
  })

  return NextResponse.json({ ok: true })
}
