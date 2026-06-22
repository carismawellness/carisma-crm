'use client'

import { useEffect, useState } from 'react'

export function useResponseTimer(waitingSince: string | null) {
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)

  useEffect(() => {
    if (!waitingSince) {
      setElapsedMs(null)
      return
    }

    const update = () => {
      setElapsedMs(Date.now() - new Date(waitingSince).getTime())
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [waitingSince])

  return elapsedMs
}
