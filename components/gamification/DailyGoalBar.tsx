'use client'

import { DAILY_GOAL_TARGET } from '@/lib/constants'
import { Target } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  closed: number
}

export function DailyGoalBar({ closed }: Props) {
  const pct = Math.min(100, (closed / DAILY_GOAL_TARGET) * 100)
  const done = closed >= DAILY_GOAL_TARGET

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          <Target className="w-3 h-3" />
          Daily goal
        </span>
        <span className={`text-[11px] font-semibold ${done ? 'text-emerald-500' : 'text-muted-foreground/60'}`}>
          {closed}/{DAILY_GOAL_TARGET}
        </span>
      </div>
      <div className="h-1.5 bg-foreground/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{
            background: done
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #96B2B2, #6391AB)',
          }}
        />
      </div>
    </div>
  )
}
