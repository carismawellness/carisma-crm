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
      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-400/20"
    >
      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400/50" />
      <span className="text-[12px] font-semibold text-orange-600 dark:text-orange-400">
        {streak}
      </span>
    </motion.div>
  )
}
