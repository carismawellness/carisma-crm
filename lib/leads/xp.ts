import type { createServiceClient } from '@/lib/supabase/server'
import { getLevelFromXp } from '@/lib/gamification/xp'

interface AwardXpArgs {
  agentId: string
  eventType: string
  xp: number
  leadId: string
}

/**
 * Award XP to an agent: record the XP event, then bump the agent's running
 * total and recompute their level. No-op when xp <= 0.
 */
export async function awardXp(
  service: ReturnType<typeof createServiceClient>,
  { agentId, eventType, xp, leadId }: AwardXpArgs
): Promise<void> {
  if (xp <= 0) return

  await service.from('crm_xp_events').insert({
    agent_id: agentId,
    event_type: eventType,
    xp_earned: xp,
    lead_id: leadId,
  })

  const { data: agent } = await service
    .from('crm_agents')
    .select('xp')
    .eq('id', agentId)
    .single()
  if (agent) {
    const newXp = (agent.xp ?? 0) + xp
    await service.from('crm_agents').update({
      xp: newXp,
      level: getLevelFromXp(newXp),
    }).eq('id', agentId)
  }
}
