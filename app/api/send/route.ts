import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendGhlMessage } from '@/lib/ghl/client'
import { BRANDS } from '@/lib/constants'
import { calculateReplyXp, getLevelFromXp } from '@/lib/gamification/xp'
import type { BrandId, Channel } from '@/lib/constants'

const GHL_TYPE_MAP: Record<Channel, 'WhatsApp' | 'IG' | 'FB'> = {
  whatsapp: 'WhatsApp',
  instagram: 'IG',
  facebook: 'FB',
  gmail: 'WhatsApp', // fallback — gmail handled separately
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversation_id, body } = await req.json()
  if (!conversation_id || !body?.trim()) {
    return NextResponse.json({ error: 'Missing conversation_id or body' }, { status: 400 })
  }

  const service = createServiceClient()

  // Fetch conversation
  const { data: conv, error: convError } = await service
    .from('crm_conversations')
    .select('*')
    .eq('id', conversation_id)
    .single()
  if (convError || !conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  // Calculate response time
  const responseTimeMs = conv.waiting_since
    ? Date.now() - new Date(conv.waiting_since).getTime()
    : null

  // Send via GHL
  if (conv.ghl_conversation_id) {
    const brand = BRANDS[conv.brand_id as BrandId]
    await sendGhlMessage(
      brand.ghlApiKey,
      conv.ghl_conversation_id,
      body,
      GHL_TYPE_MAP[conv.channel as Channel]
    )
  }

  const now = new Date().toISOString()

  // Save outbound message
  await service.from('crm_messages').insert({
    conversation_id,
    direction: 'outbound',
    body,
    sent_at: now,
    agent_id: user.id,
    response_time_ms: responseTimeMs,
  })

  // Clear waiting_since + update timestamps
  await service.from('crm_conversations').update({
    last_message_at: now,
    waiting_since: null,
    unread_count: 0,
  }).eq('id', conversation_id)

  // Award XP for fast reply
  if (responseTimeMs !== null) {
    const xpEarned = calculateReplyXp(responseTimeMs)
    if (xpEarned > 0) {
      await service.from('crm_xp_events').insert({
        agent_id: user.id,
        event_type: 'fast_reply',
        xp_earned: xpEarned,
        conversation_id,
      })
      const { data: agent } = await service
        .from('crm_agents')
        .select('xp')
        .eq('id', user.id)
        .single()
      if (agent) {
        const newXp = (agent.xp ?? 0) + xpEarned
        await service.from('crm_agents').update({
          xp: newXp,
          level: getLevelFromXp(newXp),
        }).eq('id', user.id)
      }
    }
  }

  return NextResponse.json({ ok: true, responseTimeMs })
}
