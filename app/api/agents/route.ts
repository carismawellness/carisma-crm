import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Agent list for the Tasks assign dropdown.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: agents } = await service
    .from('crm_agents')
    .select('id, name, assigned_brands')
    .order('name')

  return NextResponse.json({ agents: agents ?? [] })
}
