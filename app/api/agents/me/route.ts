import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { DAILY_GOAL_TARGET } from '@/lib/constants'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: agent }, { count: closedToday }] = await Promise.all([
    service.from('crm_agents').select('*').eq('id', user.id).single(),
    service
      .from('crm_xp_events')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', user.id)
      .eq('event_type', 'conversation_closed')
      .gte('created_at', `${today}T00:00:00Z`),
  ])

  return NextResponse.json({
    agent: agent ?? null,
    dailyProgress: {
      closed: closedToday ?? 0,
      target: DAILY_GOAL_TARGET,
    },
  })
}
