import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Unified contact detail: the person + their chat threads + their leads.
// Powers the Contacts detail drawer and the Conversations contact panel.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  const [{ data: conversations }, { data: opportunities }] = await Promise.all([
    supabase
      .from('crm_conversations')
      .select('*')
      .eq('contact_id', id)
      .order('last_message_at', { ascending: false }),
    supabase
      .from('crm_leads')
      .select('*, stage:crm_pipeline_stages(*)')
      .eq('contact_id', id)
      .order('lead_score', { ascending: false }),
  ])

  return NextResponse.json({
    contact,
    conversations: conversations ?? [],
    opportunities: opportunities ?? [],
  })
}
