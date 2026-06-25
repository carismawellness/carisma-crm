import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

// Self-healing agent row.
// crm_lead_activities.agent_id and crm_xp_events.agent_id are FKs to
// crm_agents(id). An authenticated CRM user may not yet have an agent row
// (e.g. created via the Supabase dashboard), which would make those inserts
// fail the FK silently. Call this at the top of any route that writes an
// activity or XP keyed on the acting user, so agent_id always resolves.
export async function ensureAgent(service: SupabaseClient, user: User): Promise<void> {
  const email = user.email ?? `${user.id}@carisma.local`
  const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  await service
    .from('crm_agents')
    .upsert(
      { id: user.id, email, name },
      { onConflict: 'id', ignoreDuplicates: true }
    )
}
