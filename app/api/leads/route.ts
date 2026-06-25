import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LeadWithContact } from '@/types'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brand_id')
  const status = searchParams.get('status') ?? 'open'
  const assignedAgentId = searchParams.get('assigned_agent_id')

  let query = supabase
    .from('crm_leads')
    .select('*, contact:crm_contacts(*), stage:crm_pipeline_stages(*)')
    .order('lead_score', { ascending: false })
    .limit(100)

  if (brandId) query = query.eq('brand_id', brandId)
  if (status !== 'all') query = query.eq('status', status)
  if (assignedAgentId) query = query.eq('assigned_agent_id', assignedAgentId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ leads: (data ?? []) as LeadWithContact[] })
}
