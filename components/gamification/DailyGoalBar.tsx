'use client'

import { DAILY_GOAL_TARGET } from '@/lib/constants'

interface Props {
  closed: number
}

export function DailyGoalBar({ closed }: Props) {
  const pct = Math.min(100, (closed / DAILY_GOAL_TARGET) * 100)
  const done = closed >= DAILY_GOAL_TARGET

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Today</span>
        <span className={done ? 'text-green-600 font-medium' : ''}>
          {closed} / {DAILY_GOAL_TARGET}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: done ? '#16a34a' : '#96B2B2',
          }}
        />
      </div>
    </div>
  )
}
