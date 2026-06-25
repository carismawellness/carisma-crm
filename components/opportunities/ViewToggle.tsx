'use client'

import { LayoutGrid, List } from 'lucide-react'
import { motion } from 'framer-motion'

export type OpportunityView = 'board' | 'list'

interface Props {
  view: OpportunityView
  onChange: (view: OpportunityView) => void
  disabled?: boolean
}

const OPTIONS: { value: OpportunityView; label: string; icon: React.ReactNode }[] = [
  { value: 'board', label: 'Board', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { value: 'list', label: 'List', icon: <List className="w-3.5 h-3.5" /> },
]

export function ViewToggle({ view, onChange, disabled }: Props) {
  return (
    <div
      className="inline-flex items-center gap-0.5 p-0.5 rounded-full"
      style={{ background: 'rgba(40,55,44,0.06)', border: '1px solid rgba(40,55,44,0.10)' }}
    >
      {OPTIONS.map(opt => {
        const active = view === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase transition-colors disabled:opacity-40"
            style={{
              fontFamily: "'Novecento Wide', sans-serif",
              letterSpacing: '1px',
              color: active ? '#ffffff' : '#4f7256',
              fontWeight: active ? 700 : 500,
            }}
          >
            {active && (
              <motion.div
                layoutId="opportunity-view-toggle"
                className="absolute inset-0 rounded-full"
                style={{ background: '#024C27' }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
