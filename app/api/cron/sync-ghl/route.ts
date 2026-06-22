import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchGhlConversations, fetchGhlMessages } from '@/lib/ghl/client'
import { resolveChannelFromGhl } from '@/lib/ghl/normalizer'

interface BrandConfig {
  id: string
  apiKey: string
  locationId: string
}

const BRANDS: BrandConfig[] = [
  {
    id: 'spa',
    apiKey: process.env.GHL_SPA_API_KEY ?? '',
    locationId: process.env.GHL_SPA_LOCATION_ID ?? '',
  },
  {
    id: 'aesthetics',
    apiKey: process.env.GHL_AESTHETICS_API_KEY ?? '',
    locationId: process.env.GHL_AESTHETICS_LOCATION_ID ?? '',
  },
  {
    id: 'slimming',
    apiKey: process.env.GHL_SLIMMING_API_KEY ?? '',
    locationId: process.env.GHL_SLIMMING_LOCATION_ID ?? '',
  },
]

// Only sync conversations updated in the last 10 minutes (or 5 min for cron cadence)
const SYNC_WINDOW_MS = 10 * 60 * 1000

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = Date.now()
  const cutoff = now - SYNC_WINDOW_MS
  const results: Record<string, { conversations: number; messages: number; errors: string[] }> = {}

  for (const brand of BRANDS) {
    if (!brand.apiKey || brand.apiKey === 'placeholder' || !brand.locationId || brand.locationId === 'placeholder') {
      continue
    }

    const brandResult = { conversations: 0, messages: 0, errors: [] as string[] }
    results[brand.id] = brandResult

    try {
      const conversations = await fetchGhlConversations(brand.apiKey, brand.locationId, 50)

      // Only process conversations updated in the sync window
      const recent = conversations.filter(c => c.dateUpdated >= cutoff)

      for (const conv of recent) {
        try {
          const nowIso = new Date().toISOString()
          const channel = resolveChannelFromGhl(conv.lastMessageType)

          // Upsert conversation — only update waiting_since if there are unread inbound messages
          const updatePayload: Record<string, unknown> = {
            brand_id: brand.id,
            channel,
            contact_name: conv.fullName ?? conv.contactName ?? 'Unknown',
            contact_identifier: conv.phone ?? conv.email ?? conv.contactId,
            ghl_conversation_id: conv.id,
            last_message_at: conv.lastMessageDate
              ? new Date(conv.lastMessageDate).toISOString()
              : nowIso,
            unread_count: conv.unreadCount ?? 0,
            status: 'open',
          }

          // Only set waiting_since if there are unread inbound messages and conversation is unresolved
          if (conv.unreadCount > 0 && conv.lastMessageDirection === 'inbound') {
            updatePayload.waiting_since = updatePayload.last_message_at
          }

          const { data: upserted, error: upsertErr } = await supabase
            .from('crm_conversations')
            .upsert(updatePayload, { onConflict: 'ghl_conversation_id', ignoreDuplicates: false })
            .select('id, ghl_conversation_id')
            .single()

          if (upsertErr) {
            brandResult.errors.push(`conv upsert ${conv.id}: ${upsertErr.message}`)
            continue
          }

          brandResult.conversations++

          // Sync the last 20 messages for this conversation
          try {
            const messages = await fetchGhlMessages(brand.apiKey, conv.id, 20)

            for (const msg of messages) {
              // Skip system/activity messages
              if (
                msg.messageType?.includes('ACTIVITY') ||
                msg.messageType?.includes('CALL') ||
                !msg.body?.trim()
              ) continue

              await supabase.from('crm_messages').upsert(
                {
                  conversation_id: upserted.id,
                  ghl_message_id: msg.id,
                  direction: msg.direction === 'inbound' ? 'inbound' : 'outbound',
                  body: msg.body ?? '',
                  sent_at: msg.dateAdded ?? nowIso,
                  sender_name: msg.direction === 'inbound'
                    ? (conv.fullName ?? conv.contactName ?? 'Unknown')
                    : 'Agent',
                  channel_metadata: msg,
                },
                { onConflict: 'ghl_message_id', ignoreDuplicates: true }
              )

              brandResult.messages++
            }
          } catch (msgErr) {
            brandResult.errors.push(`msgs ${conv.id}: ${String(msgErr)}`)
          }
        } catch (convErr) {
          brandResult.errors.push(`conv ${conv.id}: ${String(convErr)}`)
        }
      }
    } catch (err) {
      brandResult.errors.push(`fetch: ${String(err)}`)
    }
  }

  return NextResponse.json({ ok: true, synced: results, ts: new Date().toISOString() })
}
