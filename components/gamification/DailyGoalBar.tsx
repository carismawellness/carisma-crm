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
        <span
          className="flex items-center gap-1 text-[10px] uppercase"
          style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2px', color: '#8eb093', fontWeight: 700 }}
        >
          <Target className="w-3 h-3" />
          Daily goal
        </span>
        <span
          className="text-[11px] font-semibold"
          style={{ color: done ? '#024C27' : '#8eb093', fontFamily: "'Novecento Wide', sans-serif" }}
        >
          {closed}/{DAILY_GOAL_TARGET}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(40,55,44,0.10)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          style={{
            background: done
              ? 'linear-gradient(90deg, #024C27, #4f7256)'
              : 'linear-gradient(90deg, #4f7256, #8eb093)',
          }}
        />
      </div>
    </div>
  )
}
