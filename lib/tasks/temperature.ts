import { LEAD_COLD_MS } from '@/lib/constants'
import type { Lead, LeadTemperature } from '@/types'

/**
 * Derives a lead's temperature for the Tasks queue. There is no stored
 * `temperature` column, so it is computed from SLA + recency signals:
 *  - hot  : open lead whose first-contact SLA window has elapsed (needs action now)
 *  - cold : no activity for longer than LEAD_COLD_MS
 *  - warm : everything else that is still open
 * Won/lost/abandoned leads are treated as cold (out of the live queue).
 */
export function leadTemperature(lead: Pick<Lead, 'status' | 'sla_due_at' | 'last_activity_at' | 'first_contacted_at'>): LeadTemperature {
  if (lead.status !== 'open') return 'cold'

  const now = Date.now()

  // SLA breached and not yet contacted => hot.
  if (lead.sla_due_at && !lead.first_contacted_at) {
    if (new Date(lead.sla_due_at).getTime() <= now) return 'hot'
  }

  const lastActivity = lead.last_activity_at
    ? new Date(lead.last_activity_at).getTime()
    : null
  if (lastActivity !== null && now - lastActivity > LEAD_COLD_MS) return 'cold'

  return 'warm'
}

export function isSlaBreached(lead: Pick<Lead, 'status' | 'sla_due_at' | 'first_contacted_at'>): boolean {
  if (lead.status !== 'open') return false
  if (!lead.sla_due_at || lead.first_contacted_at) return false
  return new Date(lead.sla_due_at).getTime() <= Date.now()
}
