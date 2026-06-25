'use client'

import { useEffect, useState } from 'react'

interface SlaState {
  remainingMs: number | null
  breached: boolean
}

export function useLeadSla(slaDueAt: string | null): SlaState {
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  useEffect(() => {
    if (!slaDueAt) {
      setRemainingMs(null)
      return
    }

    const update = () => {
      setRemainingMs(new Date(slaDueAt).getTime() - Date.now())
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [slaDueAt])

  return {
    remainingMs,
    breached: remainingMs !== null && remainingMs <= 0,
  }
}
