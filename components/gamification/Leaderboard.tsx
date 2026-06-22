'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'

interface Entry {
  agent_id: string
  name: string
  closed: number
}

const RANK_COLORS = [
  'text-yellow-500',
  'text-slate-400',
  'text-amber-600',
]
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
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        <Trophy className="w-3 h-3" />
        Today
      </span>
      <div className="space-y-1.5">
        {entries.slice(0, 3).map((e, i) => (
          <div key={e.agent_id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-[10px] font-bold w-5 shrink-0 ${RANK_COLORS[i]}`}>
                {RANK_LABELS[i]}
              </span>
              <span className="text-[12px] text-foreground/70 truncate font-medium">{e.name}</span>
            </div>
            <span className="text-[11px] text-muted-foreground/50 shrink-0 font-mono">{e.closed}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
