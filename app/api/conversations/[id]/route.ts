import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: conversation, error: convError }, { data: messages }] = await Promise.all([
    supabase.from('crm_conversations').select('*').eq('id', id).single(),
    supabase
      .from('crm_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('sent_at', { ascending: true }),
  ])

  if (convError) return NextResponse.json({ error: convError.message }, { status: 404 })

  // Clear unread count when agent opens
  await supabase.from('crm_conversations').update({ unread_count: 0 }).eq('id', id)

  return NextResponse.json({ conversation, messages: messages ?? [] })
}
