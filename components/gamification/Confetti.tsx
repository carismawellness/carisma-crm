'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function Confetti() {
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#96B2B2', '#024C27', '#9B8D83', '#DEEBEB', '#C9D8C1'],
    })
  }, [])
  return null
}
