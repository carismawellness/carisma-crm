import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface LeaderboardRow {
  agent_id: string
  name: string
  closed: number
  xp: number
}

export async function GET() {
  const service = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await service
    .from('crm_xp_events')
    .select(`
      agent_id,
      xp_earned,
      crm_agents ( name )
    `)
    .eq('event_type', 'conversation_closed')
    .gte('created_at', `${today}T00:00:00Z`)

  if (error || !data) return NextResponse.json([])

  const byAgent: Record<string, { name: string; closed: number; xp: number }> = {}

  for (const row of data as any[]) {
    const id: string = row.agent_id
    if (!byAgent[id]) {
      byAgent[id] = {
        name: row.crm_agents?.name ?? 'Agent',
        closed: 0,
        xp: 0,
      }
    }
    byAgent[id].closed += 1
    byAgent[id].xp += row.xp_earned
  }

  const leaderboard: LeaderboardRow[] = Object.entries(byAgent)
    .map(([agent_id, v]) => ({ agent_id, ...v }))
    .sort((a, b) => b.closed - a.closed)
    .slice(0, 10)

  return NextResponse.json(leaderboard)
}
