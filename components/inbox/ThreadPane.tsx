'use client'

import { useEffect, useRef } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { MessageBubble } from './MessageBubble'
import { ReplyBox } from './ReplyBox'
import { ResponseTimer } from './ResponseTimer'
import { BRANDS, CHANNEL_LABELS } from '@/lib/constants'
import type { BrandId, Channel } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

interface Props {
  conversationId: string | null
  onConversationClosed?: () => void
}

export function ThreadPane({ conversationId, onConversationClosed }: Props) {
  const { messages, conversation, refetch } = useMessages(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!conversationId || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-2xl">💬</p>
          <p className="text-sm text-gray-400">Select a conversation to get started</p>
        </div>
      </div>
    )
  }

  const brand = BRANDS[conversation.brand_id as BrandId]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-base">
              {conversation.contact_name ?? 'Unknown'}
            </span>
            <ResponseTimer waitingSince={conversation.waiting_since} />
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: brand?.color ?? '#96B2B2' }}
            >
              {brand?.name ?? conversation.brand_id}
            </span>
            <span className="text-xs text-gray-400">
              {CHANNEL_LABELS[conversation.channel as Channel]}
            </span>
            <Badge
              variant="outline"
              className="text-xs capitalize h-5"
            >
              {conversation.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm pt-8">
            No messages yet
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {conversation.status !== 'closed' && (
        <ReplyBox
          conversationId={conversationId}
          onSent={refetch}
          onClosed={() => {
            refetch()
            onConversationClosed?.()
          }}
        />
      )}

      {conversation.status === 'closed' && (
        <div className="border-t bg-gray-50 px-6 py-4 text-center text-sm text-gray-400">
          This conversation is closed.
        </div>
      )}
    </div>
  )
}
