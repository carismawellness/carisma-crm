import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { TasksLeaderboardEntry } from '@/types'

interface LeaderboardRow {
  agent_id: string
  name: string
  closed: number
  xp: number
}

export async function GET(req: NextRequest) {
  const board = new URL(req.url).searchParams.get('board')
  if (board === 'tasks') return tasksLeaderboard()

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

const TASK_EVENT_TYPES = ['lead_booked', 'lead_won', 'speed_to_lead']

async function tasksLeaderboard(): Promise<NextResponse> {
  const service = createServiceClient()
  // Malta = UTC+2
  const today = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const since = `${today}T00:00:00Z`

  // Today's task XP events, keyed by agent.
  const { data: events, error } = await service
    .from('crm_xp_events')
    .select('agent_id, event_type, xp_earned, crm_agents ( name )')
    .in('event_type', TASK_EVENT_TYPES)
    .gte('created_at', since)

  if (error || !events) return NextResponse.json([])

  interface Acc {
    name: string
    leads_booked: number
    leads_won: number
    xp_today: number
  }
  const byAgent: Record<string, Acc> = {}

  for (const row of events as Array<{
    agent_id: string
    event_type: string
    xp_earned: number
    crm_agents?: { name?: string } | null
  }>) {
    const id = row.agent_id
    if (!byAgent[id]) {
      byAgent[id] = {
        name: row.crm_agents?.name ?? 'Agent',
        leads_booked: 0,
        leads_won: 0,
        xp_today: 0,
      }
    }
    if (row.event_type === 'lead_booked') byAgent[id].leads_booked += 1
    if (row.event_type === 'lead_won') byAgent[id].leads_won += 1
    byAgent[id].xp_today += row.xp_earned
  }

  // Avg speed-to-lead today = mean(first_contacted_at - external_created_at)
  // over leads first-contacted today, per assigned agent.
  const { data: leads } = await service
    .from('crm_leads')
    .select('assigned_agent_id, external_created_at, first_contacted_at')
    .gte('first_contacted_at', since)

  const speed: Record<string, { total: number; n: number }> = {}
  for (const lead of (leads ?? []) as Array<{
    assigned_agent_id: string | null
    external_created_at: string | null
    first_contacted_at: string | null
  }>) {
    const id = lead.assigned_agent_id
    if (!id || !lead.external_created_at || !lead.first_contacted_at) continue
    const created = Date.parse(lead.external_created_at)
    const contacted = Date.parse(lead.first_contacted_at)
    if (Number.isNaN(created) || Number.isNaN(contacted)) continue
    if (!speed[id]) speed[id] = { total: 0, n: 0 }
    speed[id].total += Math.max(0, contacted - created)
    speed[id].n += 1
  }

  const board: TasksLeaderboardEntry[] = Object.entries(byAgent)
    .map(([agent_id, v]) => ({
      agent_id,
      name: v.name,
      leads_booked: v.leads_booked,
      leads_won: v.leads_won,
      avg_speed_to_lead_ms: speed[agent_id] ? speed[agent_id].total / speed[agent_id].n : null,
      xp_today: v.xp_today,
    }))
    .sort((a, b) => b.leads_booked - a.leads_booked || b.xp_today - a.xp_today)
    .slice(0, 10)

  return NextResponse.json(board)
}
