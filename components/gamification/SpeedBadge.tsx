'use client'

import type { SpeedRating } from '@/types'
import { Zap, Rocket, Snail } from 'lucide-react'
import { cn } from '@/lib/utils'

const CONFIG: Record<SpeedRating, { label: string; icon: React.ReactNode; className: string }> = {
  lightning: {
    label: 'Lightning',
    icon: <Zap className="w-3 h-3 fill-current" />,
    className: 'bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 border-yellow-400/30',
  },
  fast: {
    label: 'Fast',
    icon: <Rocket className="w-3 h-3" />,
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  slow: {
    label: 'Slow',
    icon: <Snail className="w-3 h-3" />,
    className: 'bg-muted text-muted-foreground border-border',
  },
}

interface Props {
  rating: SpeedRating
}

export function SpeedBadge({ rating }: Props) {
  const { label, icon, className } = CONFIG[rating]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
        className
      )}
    >
      {icon}
      {label}
    </span>
  )
}
