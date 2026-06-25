import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resolveChannelFromGhl, resolveBrandFromLocationId } from '@/lib/ghl/normalizer'
import type { GhlWebhookPayload } from '@/lib/ghl/normalizer'
import { upsertLeadFromProvider } from '@/lib/leads/sync'
import type { BrandId } from '@/lib/constants'
import type { LeadStatus } from '@/types'
import type { ProviderContact, ProviderLead } from '@/lib/leads/provider'

const OPPORTUNITY_EVENTS = new Set([
  'OpportunityCreate',
  'OpportunityUpdate',
  'OpportunityStageUpdate',
  'OpportunityStatusUpdate',
  'OpportunityDelete',
])
const CONTACT_EVENTS = new Set(['ContactCreate', 'ContactUpdate'])

export async function POST(req: NextRequest) {
  try {
    // GHL sends a webhook-secret header — verify it if set
    const secret = process.env.GHL_WEBHOOK_SECRET
    if (secret && secret !== 'placeholder') {
      const incoming = req.headers.get('x-webhook-secret') ?? req.headers.get('x-ghl-signature') ?? ''
      if (incoming !== secret) {
        console.warn('GHL webhook: invalid secret')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const payload: GhlWebhookPayload = await req.json()

    // Opportunity / contact events feed the Tasks (lead pipeline) mirror.
    if (OPPORTUNITY_EVENTS.has(payload.type)) {
      return await handleOpportunityEvent(payload)
    }
    if (CONTACT_EVENTS.has(payload.type)) {
      // Contact-only events: nothing to mirror without an owning lead;
      // lead upserts carry the contact. Ack so GHL doesn't retry.
      return NextResponse.json({ ok: true, skipped: true })
    }

    // Only process inbound messages
    if (payload.direction !== 'inbound' && payload.type !== 'InboundMessage') {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const brandId = resolveBrandFromLocationId(payload.locationId)
    if (!brandId) {
      console.warn('Unknown GHL locationId:', payload.locationId)
      return NextResponse.json({ ok: true, skipped: true })
    }

    const channel = resolveChannelFromGhl(payload.messageType)
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    // Upsert conversation
    const { data: conversation, error: convError } = await supabase
      .from('crm_conversations')
      .upsert(
        {
          brand_id: brandId,
          channel,
          contact_name: payload.contactName ?? 'Unknown',
          contact_identifier: payload.phone ?? payload.email ?? payload.contactId,
          ghl_conversation_id: payload.conversationId,
          status: 'open',
          last_message_at: payload.dateAdded ?? now,
          waiting_since: now,
        },
        { onConflict: 'ghl_conversation_id' }
      )
      .select('id')
      .single()

    if (convError) throw convError

    // Insert message
    const { error: msgError } = await supabase.from('crm_messages').insert({
      conversation_id: conversation.id,
      direction: 'inbound',
      body: payload.body ?? '',
      sent_at: payload.dateAdded ?? now,
      sender_name: payload.contactName ?? 'Unknown',
      channel_metadata: payload,
    })

    if (msgError) throw msgError

    // Increment unread
    await supabase.rpc('increment_unread', { conv_id: conversation.id })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('GHL webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ---- Opportunity (lead) webhook handling ----

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

function toLeadStatus(v: unknown): LeadStatus {
  const s = asString(v)
  return s === 'won' || s === 'lost' || s === 'abandoned' ? s : 'open'
}

/**
 * Mirror an opportunity webhook into crm_leads via the sync layer. Builds a
 * provider-agnostic ProviderLead/ProviderContact from the payload (same field
 * names as the /opportunities/search shape). Defensive: missing brand/id ->
 * 200 ack so GHL doesn't retry a payload we can't place.
 */
async function handleOpportunityEvent(
  payload: GhlWebhookPayload
): Promise<NextResponse> {
  const brandId = resolveBrandFromLocationId(payload.locationId) as BrandId | null
  if (!brandId) {
    console.warn('Opportunity webhook: unknown locationId', payload.locationId)
    return NextResponse.json({ ok: true, skipped: true })
  }

  const externalId = asString(payload.id)
  if (!externalId) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  // OpportunityDelete: mark the mirror row abandoned rather than hard-delete.
  if (payload.type === 'OpportunityDelete') {
    const service = createServiceClient()
    await service
      .from('crm_leads')
      .update({ status: 'abandoned', updated_at: new Date().toISOString() })
      .eq('provider', 'ghl')
      .eq('external_id', externalId)
    return NextResponse.json({ ok: true })
  }

  const embedded = (payload.contact ?? null) as Record<string, unknown> | null
  const contactExternalId =
    asString(payload.contactId) ?? (embedded ? asString(embedded.id) : undefined) ?? null

  const lead: ProviderLead = {
    externalId,
    brandId,
    name: asString(payload.name) ?? null,
    monetaryValue: typeof payload.monetaryValue === 'number' ? payload.monetaryValue : 0,
    status: toLeadStatus(payload.status),
    stageExternalId: asString(payload.pipelineStageId) ?? null,
    source: asString(payload.source) ?? null,
    contactExternalId,
    assignedProviderUserId: asString(payload.assignedTo) ?? null,
    externalCreatedAt:
      asString(payload.createdAt) ?? asString(payload.dateAdded) ?? null,
  }

  let contactDto: ProviderContact | null = null
  if (embedded && contactExternalId) {
    contactDto = {
      externalId: contactExternalId,
      brandId,
      name: asString(embedded.name) ?? null,
      phone: asString(embedded.phone) ?? null,
      email: asString(embedded.email) ?? null,
      source: asString(payload.source) ?? null,
      tags: Array.isArray(embedded.tags) ? (embedded.tags as string[]) : [],
    }
  }

  const leadId = await upsertLeadFromProvider(brandId, lead, contactDto)

  const service = createServiceClient()
  await service.from('crm_lead_activities').insert({
    lead_id: leadId,
    agent_id: null,
    type: 'system',
    body: `GHL ${payload.type}`,
    metadata: { webhook_type: payload.type },
  })

  return NextResponse.json({ ok: true })
}
