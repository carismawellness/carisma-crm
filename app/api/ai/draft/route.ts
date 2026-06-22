import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDraft } from '@/lib/ai/draft'
import { fetchGhlMessages } from '@/lib/ghl/client'
import type { BrandId } from '@/lib/constants'

const BRAND_KEYS: Record<string, string> = {
  spa: process.env.GHL_SPA_API_KEY ?? '',
  aesthetics: process.env.GHL_AESTHETICS_API_KEY ?? '',
  slimming: process.env.GHL_SLIMMING_API_KEY ?? '',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversation_id } = await req.json()
  if (!conversation_id) {
    return NextResponse.json({ error: 'Missing conversation_id' }, { status: 400 })
  }

  const { data: conv } = await supabase
    .from('crm_conversations')
    .select('brand_id, ghl_conversation_id')
    .eq('id', conversation_id)
    .single()

  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  // Fetch last 10 messages live from GHL for context
  let messages: Record<string, unknown>[] = []
  const apiKey = BRAND_KEYS[conv.brand_id]
  if (apiKey && conv.ghl_conversation_id) {
    try {
      const raw = await fetchGhlMessages(apiKey, conv.ghl_conversation_id, 10)
      messages = raw
        .filter(m => !m.messageType?.includes('ACTIVITY') && !m.messageType?.includes('CALL') && m.body?.trim())
        .map(m => ({
          direction: m.direction === 'inbound' ? 'inbound' : 'outbound',
          body: m.body,
          sent_at: m.dateAdded,
        }))
    } catch {
      // proceed with empty context
    }
  }

  try {
    const draft = await generateDraft(messages, conv.brand_id as BrandId)
    return NextResponse.json({ draft })
  } catch (err) {
    console.error('Draft generation error:', err)
    return NextResponse.json({ draft: '' })
  }
}
