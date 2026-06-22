'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface Props {
  streak: number
}

export function StreakBadge({ streak }: Props) {
  if (!streak) return null

  return (
    <motion.div
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      className="flex items-center gap-1 px-2.5 py-1 rounded-full"
      style={{
        background: 'rgba(151,128,99,0.12)',
        border: '1px solid rgba(151,128,99,0.25)',
      }}
    >
      <Flame className="w-3.5 h-3.5" style={{ color: '#978063', fill: 'rgba(151,128,99,0.3)' }} />
      <span
        className="text-[12px] font-semibold"
        style={{ fontFamily: "'Novecento Wide', sans-serif", color: '#978063', letterSpacing: '0.5px' }}
      >
        {streak}
      </span>
    </motion.div>
  )
}
