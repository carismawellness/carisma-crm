'use client'

import { useConversations } from '@/hooks/useConversations'
import { ConversationRow } from './ConversationRow'
import type { BrandId, Channel } from '@/lib/constants'

interface Props {
  brand: BrandId | null
  channel: Channel | null
  status: string
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ConversationList({
  brand,
  channel,
  status,
  selectedId,
  onSelect,
}: Props) {
  const { conversations, loading } = useConversations({ brand, channel, status })

  return (
    <div className="w-80 flex flex-col border-r bg-white shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b shrink-0">
        <input
          type="search"
          placeholder="🔍 Search conversations..."
          className="w-full text-sm bg-gray-100 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-1">
            <span>No conversations</span>
          </div>
        ) : (
          conversations.map(conv => (
            <ConversationRow
              key={conv.id}
              conversation={conv}
              selected={conv.id === selectedId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
