'use client'

import { useEffect, useState } from 'react'
import { CHANNELS, CHANNEL_ICONS, CHANNEL_LABELS } from '@/lib/constants'
import type { Channel, BrandId } from '@/lib/constants'
import { DailyGoalBar } from '@/components/gamification/DailyGoalBar'
import { Leaderboard } from '@/components/gamification/Leaderboard'
import { cn } from '@/lib/utils'

interface Props {
  selectedBrand: BrandId | null
  onBrandChange: (b: BrandId | null) => void
  selectedChannel: Channel | null
  onChannelChange: (c: Channel | null) => void
  selectedStatus: string
  onStatusChange: (s: string) => void
}

export function Sidebar({
  selectedChannel,
  onChannelChange,
  selectedStatus,
  onStatusChange,
}: Props) {
  const [dailyProgress, setDailyProgress] = useState({ closed: 0, target: 20 })

  useEffect(() => {
    fetch('/api/agents/me')
      .then(r => r.json())
      .then(d => {
        if (d.dailyProgress) setDailyProgress(d.dailyProgress)
      })
      .catch(() => {})
  }, [])

  function FilterBtn({
    active,
    onClick,
    children,
  }: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
  }) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
          active
            ? 'bg-gray-100 font-medium text-gray-900'
            : 'text-gray-600 hover:bg-gray-50'
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="w-48 flex flex-col border-r bg-white shrink-0 overflow-y-auto">
      <div className="p-3 space-y-4 flex-1">
        {/* Channel filter */}
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-3 mb-1">
            Channels
          </p>
          <FilterBtn
            active={selectedChannel === null}
            onClick={() => onChannelChange(null)}
          >
            All channels
          </FilterBtn>
          {CHANNELS.map(ch => (
            <FilterBtn
              key={ch}
              active={selectedChannel === ch}
              onClick={() => onChannelChange(ch)}
            >
              {CHANNEL_ICONS[ch]} {CHANNEL_LABELS[ch]}
            </FilterBtn>
          ))}
        </div>

        {/* Status filter */}
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-3 mb-1">
            Status
          </p>
          {['open', 'pending', 'closed'].map(s => (
            <FilterBtn
              key={s}
              active={selectedStatus === s}
              onClick={() => onStatusChange(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </FilterBtn>
          ))}
        </div>
      </div>

      {/* Gamification */}
      <div className="p-3 border-t space-y-4">
        <DailyGoalBar closed={dailyProgress.closed} />
        <Leaderboard />
      </div>
    </div>
  )
}
