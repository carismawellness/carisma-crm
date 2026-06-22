'use client'

import { useEffect, useState } from 'react'
import { CHANNELS, CHANNEL_LABELS } from '@/lib/constants'
import { CHANNEL_SVG_ICONS, CHANNEL_ICON_COLORS } from '@/lib/channel-icons'
import type { Channel, BrandId } from '@/lib/constants'
import { DailyGoalBar } from '@/components/gamification/DailyGoalBar'
import { Leaderboard } from '@/components/gamification/Leaderboard'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Circle, Clock, CheckCircle2 } from 'lucide-react'

interface Props {
  selectedBrand: BrandId | null
  onBrandChange: (b: BrandId | null) => void
  selectedChannel: Channel | null
  onChannelChange: (c: Channel | null) => void
  selectedStatus: string
  onStatusChange: (s: string) => void
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  open: <Circle className="w-3 h-3" style={{ color: '#4f7256' }} />,
  pending: <Clock className="w-3 h-3" style={{ color: '#978063' }} />,
  closed: <CheckCircle2 className="w-3 h-3" style={{ color: '#8eb093' }} />,
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
      .then(d => { if (d.dailyProgress) setDailyProgress(d.dailyProgress) })
      .catch(() => {})
  }, [])

  return (
    <aside
      className="w-52 flex flex-col shrink-0 overflow-hidden"
      style={{ borderRight: '1px solid rgba(40,55,44,0.10)', background: '#f7f9f6' }}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-5 pt-4">
        {/* Channels */}
        <section>
          <div className="px-2.5 mb-2">
            <p
              className="text-[10px] uppercase"
              style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2.5px', color: '#8eb093', fontWeight: 700 }}
            >
              Channels
            </p>
            <div style={{ width: 28, height: 1, background: 'rgba(79,114,86,0.3)', marginTop: 4 }} />
          </div>
          <div className="space-y-0.5">
            <NavItem
              active={selectedChannel === null}
              onClick={() => onChannelChange(null)}
              icon={
                <span
                  className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold"
                  style={{ background: 'rgba(2,76,39,0.10)', color: '#4f7256' }}
                >
                  ALL
                </span>
              }
              label="All channels"
            />
            {CHANNELS.map(ch => (
              <NavItem
                key={ch}
                active={selectedChannel === ch}
                onClick={() => onChannelChange(ch)}
                icon={
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center [&>svg]:w-2.5 [&>svg]:h-2.5"
                    style={{ backgroundColor: `${CHANNEL_ICON_COLORS[ch]}20` }}
                  >
                    {CHANNEL_SVG_ICONS[ch]}
                  </span>
                }
                label={CHANNEL_LABELS[ch]}
              />
            ))}
          </div>
        </section>

        {/* Status */}
        <section>
          <div className="px-2.5 mb-2">
            <p
              className="text-[10px] uppercase"
              style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2.5px', color: '#8eb093', fontWeight: 700 }}
            >
              Status
            </p>
            <div style={{ width: 28, height: 1, background: 'rgba(79,114,86,0.3)', marginTop: 4 }} />
          </div>
          <div className="space-y-0.5">
            {(['open', 'pending', 'closed'] as const).map(s => (
              <NavItem
                key={s}
                active={selectedStatus === s}
                onClick={() => onStatusChange(s)}
                icon={<span className="shrink-0">{STATUS_ICONS[s]}</span>}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Gamification footer */}
      <div
        className="border-t p-3 space-y-4"
        style={{ borderColor: 'rgba(40,55,44,0.10)', background: '#f2f6ef' }}
      >
        <DailyGoalBar closed={dailyProgress.closed} />
        <Leaderboard />
      </div>
    </aside>
  )
}

function NavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 1 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 text-[13px] transition-all duration-150 relative"
      style={
        active
          ? { background: 'rgba(2,76,39,0.08)', color: '#024C27', fontWeight: 600 }
          : { color: '#5a4f43' }
      }
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-bar"
          className="absolute left-0 top-1.5 bottom-1.5 rounded-r-full"
          style={{ width: 2.5, background: '#024C27' }}
        />
      )}
      <span className="shrink-0 w-4 h-4 flex items-center justify-center ml-1">{icon}</span>
      <span
        className="truncate"
        style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.5px', fontSize: '11.5px', textTransform: 'uppercase' }}
      >
        {label}
      </span>
    </motion.button>
  )
}
