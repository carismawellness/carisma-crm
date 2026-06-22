'use client'

import { HOT_THRESHOLD_MS } from '@/lib/constants'

interface Props {
  waitingSince: string | null
}

export function HotBadge({ waitingSince }: Props) {
  if (!waitingSince) return null
  const elapsed = Date.now() - new Date(waitingSince).getTime()
  if (elapsed < HOT_THRESHOLD_MS) return null

  return (
    <span
      className="text-sm leading-none animate-pulse"
      title="Waiting over 10 minutes"
    >
      🔥
    </span>
  )
}
