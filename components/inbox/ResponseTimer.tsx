'use client'

import { useResponseTimer } from '@/hooks/useResponseTimer'
import { cn } from '@/lib/utils'
import { LIGHTNING_THRESHOLD_MS, FAST_THRESHOLD_MS } from '@/lib/constants'
import { Timer } from 'lucide-react'

interface Props {
  waitingSince: string | null
}

export function ResponseTimer({ waitingSince }: Props) {
  const elapsed = useResponseTimer(waitingSince)
  if (elapsed === null) return null

  const mins = Math.floor(elapsed / 60_000)
  const secs = Math.floor((elapsed % 60_000) / 1000)
  const label = `${mins}:${String(secs).padStart(2, '0')}`

  const isLightning = elapsed <= LIGHTNING_THRESHOLD_MS
  const isFast = elapsed <= FAST_THRESHOLD_MS

  const colorClass = isLightning
    ? 'text-emerald-500 dark:text-emerald-400'
    : isFast
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-red-500 dark:text-red-400'

  const bgClass = isLightning
    ? 'bg-emerald-500/10'
    : isFast
    ? 'bg-amber-500/10'
    : 'bg-red-500/10 animate-pulse'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold',
        colorClass,
        bgClass
      )}
    >
      <Timer className="w-3 h-3" />
      {label}
    </span>
  )
}
