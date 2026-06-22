'use client'

import { useEffect, useRef } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { MessageBubble } from './MessageBubble'
import { ReplyBox } from './ReplyBox'
import { ResponseTimer } from './ResponseTimer'
import { BRANDS, CHANNEL_LABELS } from '@/lib/constants'
import type { BrandId, Channel } from '@/lib/constants'
import { CHANNEL_SVG_ICONS } from '@/lib/channel-icons'
import { MessageCircle, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  conversationId: string | null
  onConversationClosed?: () => void
}

const STATUS_STYLE = {
  open: { background: 'rgba(79,114,86,0.12)', color: '#4f7256' },
  pending: { background: 'rgba(151,128,99,0.12)', color: '#978063' },
  closed: { background: 'rgba(40,55,44,0.08)', color: '#8eb093' },
} as const

export function ThreadPane({ conversationId, onConversationClosed }: Props) {
  const { messages, conversation, refetch } = useMessages(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!conversationId || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-mesh-light dark:bg-mesh-dark">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div
            className="w-14 h-14 rounded-3xl mx-auto flex items-center justify-center"
            style={{ background: 'rgba(2,76,39,0.08)', border: '1px solid rgba(40,55,44,0.12)' }}
          >
            <MessageCircle className="w-6 h-6" style={{ color: '#8eb093' }} />
          </div>
          <div className="space-y-1">
            <p className="text-[14px] font-medium text-foreground/40">No conversation selected</p>
            <p className="text-[12px] text-muted-foreground/30">Pick one from the left to get started</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const brand = BRANDS[conversation.brand_id as BrandId]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={conversationId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div
          className="px-5 py-3 shrink-0 relative"
          style={{
            background: 'rgba(255,255,255,0.90)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(40,55,44,0.12)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: brand?.color ?? '#024C27' }}
                />
                <span
                  className="text-[14px] uppercase tracking-[1px]"
                  style={{ fontFamily: "'Trajan Pro', Georgia, serif", color: '#024C27', fontWeight: 700 }}
                >
                  {conversation.contact_name ?? 'Unknown'}
                </span>
                <ResponseTimer waitingSince={conversation.waiting_since} />
              </div>
              <div className="flex items-center gap-2 pl-4">
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: brand?.color ?? '#024C27' }}
                >
                  {brand?.name?.replace('Carisma ', '') ?? conversation.brand_id}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <span className="[&>svg]:w-3 [&>svg]:h-3">
                    {CHANNEL_SVG_ICONS[conversation.channel as Channel]}
                  </span>
                  {CHANNEL_LABELS[conversation.channel as Channel]}
                </span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize uppercase"
                  style={{
                    ...((STATUS_STYLE as Record<string, { background: string; color: string }>)[conversation.status] ?? STATUS_STYLE.open),
                    fontFamily: "'Novecento Wide', sans-serif",
                    letterSpacing: '0.8px',
                  }}
                >
                  {conversation.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-2 bg-mesh-light dark:bg-mesh-dark">
          {messages.length === 0 ? (
            <div className="text-center text-[13px] text-muted-foreground/30 pt-10">
              No messages yet
            </div>
          ) : (
            messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply / Closed */}
        {conversation.status !== 'closed' ? (
          <ReplyBox
            conversationId={conversationId}
            onSent={refetch}
            onClosed={() => {
              refetch()
              onConversationClosed?.()
            }}
          />
        ) : (
          <div
            className="border-t px-6 py-4 flex items-center justify-center gap-2"
            style={{ borderColor: 'rgba(40,55,44,0.10)', background: '#f7f9f6' }}
          >
            <Lock className="w-3.5 h-3.5" style={{ color: '#8eb093' }} />
            <span
              className="text-[11px] uppercase tracking-widest"
              style={{ fontFamily: "'Novecento Wide', sans-serif", color: '#8eb093' }}
            >
              Conversation resolved
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
