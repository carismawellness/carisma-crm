'use client'

import { useConversations } from '@/hooks/useConversations'
import { ConversationRow } from './ConversationRow'
import type { BrandId, Channel } from '@/lib/constants'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  brand: BrandId | null
  channel: Channel | null
  status: string
  selectedId: string | null
  onSelect: (id: string) => void
}

function SkeletonRow() {
  return (
    <div
      className="px-4 py-3 animate-pulse"
      style={{ borderBottom: '1px solid rgba(40,55,44,0.08)' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full shrink-0" style={{ background: 'rgba(79,114,86,0.12)' }} />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="flex justify-between">
            <div className="h-3 w-28 rounded-full" style={{ background: 'rgba(79,114,86,0.10)' }} />
            <div className="h-3 w-10 rounded-full" style={{ background: 'rgba(79,114,86,0.07)' }} />
          </div>
          <div className="h-2.5 w-40 rounded-full" style={{ background: 'rgba(79,114,86,0.07)' }} />
          <div className="h-2 w-16 rounded-full" style={{ background: 'rgba(79,114,86,0.05)' }} />
        </div>
      </div>
    </div>
  )
}

export function ConversationList({
  brand,
  channel,
  status,
  selectedId,
  onSelect,
}: Props) {
  const { conversations, loading } = useConversations({ brand, channel, status })
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? conversations.filter(c =>
        c.contact_name?.toLowerCase().includes(search.toLowerCase())
      )
    : conversations

  return (
    <div
      className="w-80 flex flex-col shrink-0 overflow-hidden"
      style={{ borderRight: '1px solid rgba(40,55,44,0.10)', background: '#fafaf8' }}
    >
      {/* Search */}
      <div
        className="px-3 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(40,55,44,0.10)' }}
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: '#8eb093' }}
          />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full text-[13px] rounded-xl pl-8 pr-3 py-2 outline-none transition-all"
            style={{
              background: 'rgba(40,55,44,0.05)',
              color: '#5a4f43',
              border: '1px solid rgba(40,55,44,0.10)',
            }}
          />
        </div>
      </div>

      {/* Count badge */}
      {!loading && filtered.length > 0 && (
        <div
          className="px-4 py-1.5 shrink-0"
          style={{ borderBottom: '1px solid rgba(40,55,44,0.06)' }}
        >
          <span
            className="text-[10px] uppercase font-bold"
            style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1.5px', color: '#8eb093' }}
          >
            {filtered.length} conversation{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(2,76,39,0.06)' }}
            >
              <Search className="w-5 h-5" style={{ color: '#8eb093' }} />
            </div>
            <div className="space-y-1">
              <p
                className="text-[12px] uppercase font-bold"
                style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1.5px', color: '#8eb093' }}
              >
                {search ? 'No results' : 'No conversations'}
              </p>
              <p className="text-[11px]" style={{ color: '#8eb093' }}>
                {search ? 'Try a different search' : 'Waiting for messages...'}
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
              >
                <ConversationRow
                  conversation={conv}
                  selected={conv.id === selectedId}
                  onClick={() => onSelect(conv.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
