'use client'

import { useEffect, useState } from 'react'

interface Entry {
  agent_id: string
  name: string
  closed: number
}

const MEDALS = ['🥇', '🥈', '🥉']

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
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        🏆 Today
      </p>
      {entries.slice(0, 3).map((e, i) => (
        <div key={e.agent_id} className="flex items-center justify-between text-sm">
          <span className="truncate">
            {MEDALS[i]} {e.name}
          </span>
          <span className="text-gray-400 shrink-0 ml-1">{e.closed}</span>
        </div>
      ))}
    </div>
  )
}
