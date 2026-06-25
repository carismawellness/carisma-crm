import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Conversation, LeadActivity, LeadDetail, LeadWithContact } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lead, error: leadError } = await supabase
    .from('crm_leads')
    .select('*, contact:crm_contacts(*), stage:crm_pipeline_stages(*)')
    .eq('id', id)
    .single()

  if (leadError || !lead) {
    return NextResponse.json({ error: leadError?.message ?? 'Not found' }, { status: 404 })
  }

  const leadWithContact = lead as LeadWithContact

  const { data: activities } = await supabase
    .from('crm_lead_activities')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: true })

  // The same person's chat threads, linked via the unified contact id.
  let conversations: Conversation[] = []
  if (leadWithContact.contact_id) {
    const { data: convs } = await supabase
      .from('crm_conversations')
      .select('*')
      .eq('contact_id', leadWithContact.contact_id)
      .order('last_message_at', { ascending: false })
    conversations = (convs ?? []) as Conversation[]
  }

  const detail: LeadDetail = {
    ...leadWithContact,
    activities: (activities ?? []) as LeadActivity[],
    conversations,
  }

  return NextResponse.json(detail)
}
