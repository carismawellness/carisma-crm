'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  label: string
  xp: number
}

export function XPToast({ label, xp }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        key="xp-toast"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 pointer-events-none"
      >
        <div className="text-2xl">⚡</div>
        <div>
          <p className="text-sm font-semibold leading-tight">{label}</p>
          <p className="text-xs text-gray-300 mt-0.5">+{xp} XP earned</p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
