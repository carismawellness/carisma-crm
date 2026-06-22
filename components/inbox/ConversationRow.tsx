'use client'

import { CHANNEL_ICONS, BRANDS } from '@/lib/constants'
import type { BrandId, Channel } from '@/lib/constants'
import type { Conversation } from '@/types'
import { HotBadge } from '@/components/gamification/HotBadge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  conversation: Conversation
  selected: boolean
  onClick: () => void
}

export function ConversationRow({ conversation: conv, selected, onClick }: Props) {
  const brand = BRANDS[conv.brand_id as BrandId]
  const hasUnread = conv.unread_count > 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b transition-colors hover:bg-gray-50',
        selected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {hasUnread && (
            <span
              className="w-2 h-2 rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: brand?.color ?? '#96B2B2' }}
            />
          )}
          <HotBadge waitingSince={conv.waiting_since} />
          <span
            className={cn(
              'text-sm truncate',
              hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
            )}
          >
            {conv.contact_name ?? 'Unknown'}
          </span>
        </div>
        <span className="text-xs text-gray-400 shrink-0 mt-0.5">
          {conv.last_message_at
            ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })
            : ''}
        </span>
      </div>

      <div className="flex items-center gap-1 mt-0.5 pl-0.5">
        <span className="text-xs">
          {CHANNEL_ICONS[conv.channel as Channel]}
        </span>
        {hasUnread && (
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white leading-none"
            style={{ backgroundColor: brand?.color ?? '#96B2B2' }}
          >
            {conv.unread_count}
          </span>
        )}
      </div>
    </button>
  )
}
