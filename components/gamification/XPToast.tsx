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
      <div
        className="rounded-2xl px-5 py-3.5 flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(2,76,39,0.18)',
          boxShadow: '0 8px 32px rgba(2,76,39,0.18), 0 2px 8px rgba(2,76,39,0.10)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: 'linear-gradient(135deg, #4f7256 0%, #024C27 100%)' }}
        >
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <div>
          <p className="text-[13px] font-semibold leading-tight" style={{ color: '#024C27', fontFamily: "'Trajan Pro', Georgia, serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </p>
          <p
            className="text-[11px] mt-0.5 uppercase tracking-wider"
            style={{ fontFamily: "'Novecento Wide', sans-serif", color: '#4f7256', letterSpacing: '1.5px' }}
          >
            +{xp} XP earned
          </p>
        </div>
      </div>
    </motion.div>
  )
}
