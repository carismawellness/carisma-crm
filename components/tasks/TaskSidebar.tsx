'use client'

import { useEffect, useState } from 'react'
import { LEAD_STATUS_LABELS, TASKS_DAILY_GOAL_TARGET } from '@/lib/constants'
import { motion } from 'framer-motion'
import {
  Circle,
  Trophy,
  XCircle,
  Target,
  User,
  Users,
  Flame,
  Sun,
  Snowflake,
} from 'lucide-react'

interface Props {
  selectedStatus: string
  onStatusChange: (s: string) => void
  ownerFilter: 'me' | 'all'
  onOwnerChange: (o: 'me' | 'all') => void
  temperature: string | null
  onTemperatureChange: (t: string | null) => void
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  open: <Circle className="w-3 h-3" style={{ color: '#4f7256' }} />,
  won: <Trophy className="w-3 h-3" style={{ color: '#024C27' }} />,
  lost: <XCircle className="w-3 h-3" style={{ color: '#b08068' }} />,
}

const TEMPERATURE_ICONS: Record<string, React.ReactNode> = {
  hot: <Flame className="w-3 h-3" style={{ color: '#e2574c' }} />,
  warm: <Sun className="w-3 h-3" style={{ color: '#d99a4e' }} />,
  cold: <Snowflake className="w-3 h-3" style={{ color: '#6391AB' }} />,
}

export function TaskSidebar({
  selectedStatus,
  onStatusChange,
  ownerFilter,
  onOwnerChange,
  temperature,
  onTemperatureChange,
}: Props) {
  const [booked, setBooked] = useState(0)

  useEffect(() => {
    fetch('/api/agents/me')
      .then(r => r.json())
      .then(d => {
        if (typeof d?.tasksProgress?.booked === 'number') {
          setBooked(d.tasksProgress.booked)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <aside
      className="w-52 flex flex-col shrink-0 overflow-hidden"
      style={{ borderRight: '1px solid rgba(40,55,44,0.10)', background: '#f7f9f6' }}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-5 pt-4">
        {/* Pipeline status */}
        <Section label="Pipeline">
          {(['open', 'won', 'lost'] as const).map(s => (
            <NavItem
              key={s}
              active={selectedStatus === s}
              onClick={() => onStatusChange(s)}
              icon={<span className="shrink-0">{STATUS_ICONS[s]}</span>}
              label={LEAD_STATUS_LABELS[s] ?? s}
            />
          ))}
        </Section>

        {/* Owner */}
        <Section label="Owner">
          <NavItem
            active={ownerFilter === 'all'}
            onClick={() => onOwnerChange('all')}
            icon={<Users className="w-3 h-3" style={{ color: '#4f7256' }} />}
            label="All leads"
          />
          <NavItem
            active={ownerFilter === 'me'}
            onClick={() => onOwnerChange('me')}
            icon={<User className="w-3 h-3" style={{ color: '#4f7256' }} />}
            label="Assigned to me"
          />
        </Section>

        {/* Temperature */}
        <Section label="Temperature">
          <NavItem
            active={temperature === null}
            onClick={() => onTemperatureChange(null)}
            icon={
              <span
                className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold"
                style={{ background: 'rgba(2,76,39,0.10)', color: '#4f7256' }}
              >
                ALL
              </span>
            }
            label="Any"
          />
          {(['hot', 'warm', 'cold'] as const).map(t => (
            <NavItem
              key={t}
              active={temperature === t}
              onClick={() => onTemperatureChange(t)}
              icon={<span className="shrink-0">{TEMPERATURE_ICONS[t]}</span>}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
            />
          ))}
        </Section>
      </div>

      {/* Gamification footer — leads booked goal */}
      <div
        className="border-t p-3 space-y-4"
        style={{ borderColor: 'rgba(40,55,44,0.10)', background: '#f2f6ef' }}
      >
        <BookedGoalBar booked={booked} />
      </div>
    </aside>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="px-2.5 mb-2">
        <p
          className="text-[10px] uppercase"
          style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2.5px', color: '#8eb093', fontWeight: 700 }}
        >
          {label}
        </p>
        <div style={{ width: 28, height: 1, background: 'rgba(79,114,86,0.3)', marginTop: 4 }} />
      </div>
      <div className="space-y-0.5">{children}</div>
    </section>
  )
}

function BookedGoalBar({ booked }: { booked: number }) {
  const pct = Math.min(100, (booked / TASKS_DAILY_GOAL_TARGET) * 100)
  const done = booked >= TASKS_DAILY_GOAL_TARGET

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span
          className="flex items-center gap-1 text-[10px] uppercase"
          style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2px', color: '#8eb093', fontWeight: 700 }}
        >
          <Target className="w-3 h-3" />
          Leads booked
        </span>
        <span
          className="text-[11px] font-semibold"
          style={{ color: done ? '#024C27' : '#8eb093', fontFamily: "'Novecento Wide', sans-serif" }}
        >
          {booked}/{TASKS_DAILY_GOAL_TARGET}
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
          layoutId="tasks-sidebar-active-bar"
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
