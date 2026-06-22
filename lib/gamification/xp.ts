import { XP, LEVELS, LIGHTNING_THRESHOLD_MS, FAST_THRESHOLD_MS } from '@/lib/constants'
import type { SpeedRating, AgentLevel } from '@/types'

export function getSpeedRating(responseTimeMs: number): SpeedRating {
  if (responseTimeMs <= LIGHTNING_THRESHOLD_MS) return 'lightning'
  if (responseTimeMs <= FAST_THRESHOLD_MS) return 'fast'
  return 'slow'
}

export function calculateReplyXp(responseTimeMs: number): number {
  const rating = getSpeedRating(responseTimeMs)
  if (rating === 'lightning') return XP.FAST_REPLY_LIGHTNING
  if (rating === 'fast') return XP.FAST_REPLY_FAST
  return 0
}

export function getLevelFromXp(totalXp: number): AgentLevel {
  let level: AgentLevel = 'Rookie'
  for (const { name, minXp } of LEVELS) {
    if (totalXp >= minXp) level = name as AgentLevel
  }
  return level
}

export function getNextLevelXp(currentLevel: AgentLevel): number | null {
  const idx = LEVELS.findIndex(l => l.name === currentLevel)
  return LEVELS[idx + 1]?.minXp ?? null
}
