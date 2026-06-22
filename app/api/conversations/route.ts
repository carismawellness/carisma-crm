import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand')
  const channel = searchParams.get('channel')
  const status = searchParams.get('status') ?? 'open'

  let query = supabase
    .from('crm_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(100)

  if (brand) query = query.eq('brand_id', brand)
  if (channel) query = query.eq('channel', channel)
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
