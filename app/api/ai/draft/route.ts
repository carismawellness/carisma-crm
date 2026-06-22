import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDraft } from '@/lib/ai/draft'
import type { BrandId } from '@/lib/constants'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversation_id } = await req.json()
  if (!conversation_id) {
    return NextResponse.json({ error: 'Missing conversation_id' }, { status: 400 })
  }

  const [{ data: conv }, { data: messages }] = await Promise.all([
    supabase.from('crm_conversations').select('brand_id').eq('id', conversation_id).single(),
    supabase
      .from('crm_messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('sent_at', { ascending: true })
      .limit(10),
  ])

  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  try {
    const draft = await generateDraft(messages ?? [], conv.brand_id as BrandId)
    return NextResponse.json({ draft })
  } catch (err) {
    console.error('Draft generation error:', err)
    return NextResponse.json({ draft: '' })
  }
}
