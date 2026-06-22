'use client'

import { HOT_THRESHOLD_MS } from '@/lib/constants'
import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  waitingSince: string | null
}

export function HotBadge({ waitingSince }: Props) {
  if (!waitingSince) return null
  const elapsed = Date.now() - new Date(waitingSince).getTime()
  if (elapsed < HOT_THRESHOLD_MS) return null

  return (
    <motion.span
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      title="Waiting over 10 minutes"
    >
      <Flame className="w-3.5 h-3.5 text-red-500 fill-red-400/40" />
    </motion.span>
  )
}
