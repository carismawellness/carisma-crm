'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCog, Check } from 'lucide-react'

interface AgentOption {
  id: string
  name: string
}

interface Props {
  currentAgentId: string | null
  disabled?: boolean
  onAssign: (agentId: string) => void | Promise<void>
}

export function AssignControl({ currentAgentId, disabled, onAssign }: Props) {
  const [open, setOpen] = useState(false)
  const [agents, setAgents] = useState<AgentOption[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : d?.agents
        if (Array.isArray(list)) {
          setAgents(list.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const current = agents.find(a => a.id === currentAgentId)

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.97 } : undefined}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all disabled:opacity-40"
        style={{
          border: '1px solid rgba(79,114,86,0.4)',
          color: '#4f7256',
          fontFamily: "'Novecento Wide', sans-serif",
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        <UserCog className="w-3.5 h-3.5" />
        {current ? current.name : 'Assign'}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1 w-52 max-h-60 overflow-y-auto scrollbar-thin rounded-xl p-1 glass"
            style={{ border: '1px solid rgba(40,55,44,0.12)' }}
          >
            {agents.length === 0 ? (
              <p className="px-3 py-2 text-[11px]" style={{ color: '#8eb093' }}>
                No agents available
              </p>
            ) : (
              agents.map(agent => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    void onAssign(agent.id)
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 text-[12px] transition-colors"
                  style={{ color: '#5a4f43' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(2,76,39,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="truncate">{agent.name}</span>
                  {agent.id === currentAgentId && (
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#024C27' }} />
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
