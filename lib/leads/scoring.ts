import { LEAD_COLD_MS, LEAD_SLA_MS } from '@/lib/constants'
import type { LeadStatus, LeadTemperature } from '@/types'

// ============================================================
// Pure lead scoring + temperature. All time-dependent functions take an
// injectable `now` (ms epoch) so they stay deterministic and testable.
// ============================================================

/** Speed-to-lead SLA deadline = creation time + LEAD_SLA_MS, as ISO. */
export function computeSlaDueAt(externalCreatedAt: string | null): string | null {
  if (!externalCreatedAt) return null
  const created = Date.parse(externalCreatedAt)
  if (Number.isNaN(created)) return null
  return new Date(created + LEAD_SLA_MS).toISOString()
}

interface LeadScoreInput {
  monetaryValue: number
  slaDueAt: string | null
  firstContactedAt: string | null
  externalCreatedAt: string | null
  status: LeadStatus
  now?: number
}

// Value above this anchors normalizedValue to 1.0 (a €2k+ lead is "max value").
const VALUE_ANCHOR = 2000
// A lead loses half its recency boost every RECENCY_HALFLIFE_MS of age.
const RECENCY_HALFLIFE_MS = 24 * 60 * 60 * 1000

/**
 * lead_score = normalizedValue * slaUrgency * recencyBoost, scaled to ~0..100.
 *
 *  - normalizedValue: monetaryValue / VALUE_ANCHOR, clamped to [0.1, 1].
 *    (Floored at 0.1 so a €0 lead still ranks on urgency/recency.)
 *  - slaUrgency: open & unworked (never first-contacted) & past SLA -> 2.0
 *    (these float to the top); open & unworked & pre-SLA -> 1.0;
 *    already worked / closed -> 0.5.
 *  - recencyBoost: exponential decay on lead age (half-life 24h), in [~0, 1].
 *
 * Closed leads (won/lost/abandoned) short-circuit to ~0 so they sink.
 */
export function computeLeadScore(input: LeadScoreInput): number {
  if (input.status !== 'open') return 0

  const now = input.now ?? Date.now()

  const normalizedValue = clamp(input.monetaryValue / VALUE_ANCHOR, 0.1, 1)

  const unworked = !input.firstContactedAt
  const pastSla = input.slaDueAt != null && Date.parse(input.slaDueAt) <= now
  let slaUrgency: number
  if (unworked && pastSla) slaUrgency = 2.0
  else if (unworked) slaUrgency = 1.0
  else slaUrgency = 0.5

  const created = input.externalCreatedAt ? Date.parse(input.externalCreatedAt) : NaN
  const ageMs = Number.isNaN(created) ? 0 : Math.max(0, now - created)
  const recencyBoost = Math.pow(0.5, ageMs / RECENCY_HALFLIFE_MS)

  return normalizedValue * slaUrgency * recencyBoost * 100
}

interface TemperatureInput {
  status: LeadStatus
  slaDueAt: string | null
  firstContactedAt: string | null
  lastActivityAt: string | null
  now?: number
}

/**
 * hot  = open & past SLA & never first-contacted (a breached, untouched lead)
 * cold = open & no activity for >= LEAD_COLD_MS
 * warm = everything else (incl. closed leads)
 */
export function resolveTemperature(input: TemperatureInput): LeadTemperature {
  if (input.status !== 'open') return 'warm'

  const now = input.now ?? Date.now()

  const pastSla = input.slaDueAt != null && Date.parse(input.slaDueAt) <= now
  if (pastSla && !input.firstContactedAt) return 'hot'

  if (input.lastActivityAt) {
    const last = Date.parse(input.lastActivityAt)
    if (!Number.isNaN(last) && now - last >= LEAD_COLD_MS) return 'cold'
  }

  return 'warm'
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
