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
  open: <Circle className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  closed: <CheckCircle2 className="w-3 h-3" />,
}

const STATUS_COLORS: Record<string, string> = {
  open: 'text-emerald-500',
  pending: 'text-amber-500',
  closed: 'text-muted-foreground',
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
    <aside className="w-52 flex flex-col shrink-0 border-r border-border/60 bg-background/80 backdrop-blur-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-5 pt-4">

        {/* Channels section */}
        <section>
          <p className="eyebrow px-2.5 mb-1.5 opacity-60">
            Channels
          </p>
          <div className="space-y-0.5">
            <NavItem
              active={selectedChannel === null}
              onClick={() => onChannelChange(null)}
              icon={
                <span className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center text-[9px] font-bold text-foreground/40">
                  ∞
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
                    className="w-4 h-4 rounded-md flex items-center justify-center [&>svg]:w-3 [&>svg]:h-3"
                    style={{ backgroundColor: `${CHANNEL_ICON_COLORS[ch]}25` }}
                  >
                    {CHANNEL_SVG_ICONS[ch]}
                  </span>
                }
                label={CHANNEL_LABELS[ch]}
              />
            ))}
          </div>
        </section>

        {/* Status section */}
        <section>
          <p className="eyebrow px-2.5 mb-1.5 opacity-60">
            Status
          </p>
          <div className="space-y-0.5">
            {(['open', 'pending', 'closed'] as const).map(s => (
              <NavItem
                key={s}
                active={selectedStatus === s}
                onClick={() => onStatusChange(s)}
                icon={
                  <span className={STATUS_COLORS[s]}>
                    {STATUS_ICONS[s]}
                  </span>
                }
                label={s.charAt(0).toUpperCase() + s.slice(1)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Gamification footer */}
      <div className="border-t border-border/50 p-3 space-y-4 bg-background/40">
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
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 text-[13px] transition-all duration-150',
        active
          ? 'bg-foreground/[0.08] font-semibold text-foreground'
          : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
      )}
    >
      <span className="shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
      {active && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className="ml-auto w-1 h-4 rounded-full bg-foreground/20"
        />
      )}
    </motion.button>
  )
}
