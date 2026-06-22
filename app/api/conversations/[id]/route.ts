import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchGhlMessages } from '@/lib/ghl/client'

const BRAND_KEYS: Record<string, string> = {
  spa: process.env.GHL_SPA_API_KEY ?? '',
  aesthetics: process.env.GHL_AESTHETICS_API_KEY ?? '',
  slimming: process.env.GHL_SLIMMING_API_KEY ?? '',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: conversation, error: convError } = await supabase
    .from('crm_conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (convError || !conversation) {
    return NextResponse.json({ error: convError?.message ?? 'Not found' }, { status: 404 })
  }

  // Clear unread count when agent opens
  await supabase.from('crm_conversations').update({ unread_count: 0 }).eq('id', id)

  // Fetch messages live from GHL if we have the connection info
  let messages: unknown[] = []
  const apiKey = BRAND_KEYS[conversation.brand_id]
  if (apiKey && conversation.ghl_conversation_id) {
    try {
      const ghlMsgs = await fetchGhlMessages(apiKey, conversation.ghl_conversation_id, 50)
      messages = ghlMsgs
        .filter(m => !m.messageType?.includes('ACTIVITY') && !m.messageType?.includes('CALL') && m.body?.trim())
        .map(m => ({
          id: m.id,
          conversation_id: id,
          ghl_message_id: m.id,
          direction: m.direction === 'inbound' ? 'inbound' : 'outbound',
          body: m.body,
          sent_at: m.dateAdded,
          sender_name: m.direction === 'inbound' ? conversation.contact_name : 'Agent',
          channel_metadata: m,
        }))
    } catch (_err) {
      // Fall back to Supabase-stored messages if GHL is unavailable
      const { data: storedMsgs } = await supabase
        .from('crm_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('sent_at', { ascending: true })
      messages = storedMsgs ?? []
    }
  } else {
    // No GHL connection — use stored messages
    const { data: storedMsgs } = await supabase
      .from('crm_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('sent_at', { ascending: true })
    messages = storedMsgs ?? []
  }

  return NextResponse.json({ conversation, messages })
}
