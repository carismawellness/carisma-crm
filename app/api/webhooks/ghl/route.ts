import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resolveChannelFromGhl, resolveBrandFromLocationId } from '@/lib/ghl/normalizer'
import type { GhlWebhookPayload } from '@/lib/ghl/normalizer'

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
