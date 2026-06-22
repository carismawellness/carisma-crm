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
    <div className="px-4 py-3 border-b border-border/40 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-foreground/8 shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="flex justify-between">
            <div className="h-3 w-28 bg-foreground/8 rounded-full" />
            <div className="h-3 w-10 bg-foreground/6 rounded-full" />
          </div>
          <div className="h-2.5 w-40 bg-foreground/6 rounded-full" />
          <div className="h-2 w-16 bg-foreground/5 rounded-full" />
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
    <div className="w-80 flex flex-col shrink-0 border-r border-border/60 bg-background/60 backdrop-blur-lg overflow-hidden">
      {/* Search */}
      <div className="px-3 py-2.5 border-b border-border/40 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full text-[13px] bg-foreground/5 dark:bg-white/5 rounded-xl pl-8 pr-3 py-2 outline-none focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground/40 text-foreground"
          />
        </div>
      </div>

      {/* Count badge */}
      {!loading && filtered.length > 0 && (
        <div className="px-4 py-1.5 border-b border-border/30 shrink-0">
          <span className="text-[11px] text-muted-foreground/50 font-medium">
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
            <div className="w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center">
              <Search className="w-5 h-5 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="text-[13px] font-medium text-foreground/40">
                {search ? 'No results' : 'No conversations'}
              </p>
              <p className="text-[11px] text-muted-foreground/30">
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
