'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'

interface Entry {
  agent_id: string
  name: string
  closed: number
}

const RANK_COLORS = ['#024C27', '#6391AB', '#978063']
const RANK_LABELS = ['1st', '2nd', '3rd']

export function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    const load = () =>
      fetch('/api/leaderboard')
        .then(r => r.json())
        .then(d => { if (Array.isArray(d)) setEntries(d) })
        .catch(() => {})

    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  if (!entries.length) return null

  return (
    <div className="space-y-2">
      <span
        className="flex items-center gap-1 text-[10px] uppercase"
        style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2px', color: '#8eb093', fontWeight: 700 }}
      >
        <Trophy className="w-3 h-3" />
        Today
      </span>
      <div className="space-y-1.5">
        {entries.slice(0, 3).map((e, i) => (
          <div key={e.agent_id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="text-[10px] font-bold w-5 shrink-0"
                style={{ color: RANK_COLORS[i], fontFamily: "'Novecento Wide', sans-serif" }}
              >
                {RANK_LABELS[i]}
              </span>
              <span
                className="text-[12px] truncate"
                style={{ color: '#5a4f43', fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.3px', textTransform: 'uppercase' }}
              >
                {e.name}
              </span>
            </div>
            <span
              className="text-[11px] shrink-0 font-mono"
              style={{ color: '#8eb093' }}
            >
              {e.closed}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
