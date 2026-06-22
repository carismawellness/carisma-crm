'use client'

import { useResponseTimer } from '@/hooks/useResponseTimer'
import { cn } from '@/lib/utils'
import { LIGHTNING_THRESHOLD_MS, FAST_THRESHOLD_MS } from '@/lib/constants'

interface Props {
  waitingSince: string | null
}

export function ResponseTimer({ waitingSince }: Props) {
  const elapsed = useResponseTimer(waitingSince)
  if (elapsed === null) return null

  const mins = Math.floor(elapsed / 60_000)
  const secs = Math.floor((elapsed % 60_000) / 1000)
  const label = `${mins}:${String(secs).padStart(2, '0')}`

  const colorClass =
    elapsed <= LIGHTNING_THRESHOLD_MS
      ? 'text-green-600'
      : elapsed <= FAST_THRESHOLD_MS
      ? 'text-amber-500'
      : 'text-red-500'

  return (
    <span className={cn('text-xs font-mono font-medium', colorClass)}>
      ⏱ {label}
    </span>
  )
}
