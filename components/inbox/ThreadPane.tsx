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
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  conversationId: string | null
  onConversationClosed?: () => void
}

const STATUS_STYLE = {
  open: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  closed: 'bg-muted text-muted-foreground',
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
          <div className="w-14 h-14 rounded-3xl glass mx-auto flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-muted-foreground/40" />
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
  const statusKey = conversation.status as keyof typeof STATUS_STYLE

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
        <div className="px-5 py-3 border-b border-border/40 glass shrink-0 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: brand?.color ?? '#96B2B2' }}
                />
                <span className="font-semibold text-[15px] text-foreground">
                  {conversation.contact_name ?? 'Unknown'}
                </span>
                <ResponseTimer waitingSince={conversation.waiting_since} />
              </div>
              <div className="flex items-center gap-2 pl-4">
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: brand?.color ?? '#96B2B2' }}
                >
                  {brand?.name?.replace('Carisma ', '') ?? conversation.brand_id}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <span className="[&>svg]:w-3 [&>svg]:h-3">
                    {CHANNEL_SVG_ICONS[conversation.channel as Channel]}
                  </span>
                  {CHANNEL_LABELS[conversation.channel as Channel]}
                </span>
                <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full capitalize', STATUS_STYLE[statusKey] ?? STATUS_STYLE.open)}>
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
          <div className="border-t border-border/30 glass px-6 py-4 flex items-center justify-center gap-2 text-muted-foreground/50">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[12px]">Conversation resolved</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
