'use client'

import { motion } from 'framer-motion'

interface Props {
  streak: number
}

export function StreakBadge({ streak }: Props) {
  if (!streak) return null

  return (
    <motion.div
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      className="flex items-center gap-1 text-orange-500 font-semibold text-sm"
    >
      🔥 {streak}
    </motion.div>
  )
}
