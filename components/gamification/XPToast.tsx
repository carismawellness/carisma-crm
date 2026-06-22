'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface Props {
  label: string
  xp: number
}

export function XPToast({ label, xp }: Props) {
  return (
    <motion.div
      key="xp-toast"
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-6 right-6 z-50 pointer-events-none"
    >
      <div className="glass rounded-2xl px-5 py-3.5 flex items-center gap-3 border border-yellow-400/20 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 dark:from-yellow-400/8 dark:to-amber-400/8 shadow-2xl">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground leading-tight">{label}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
            +{xp} XP earned
          </p>
        </div>
      </div>
    </motion.div>
  )
}
