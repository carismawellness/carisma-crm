'use client'

import { BRANDS } from '@/lib/constants'
import type { BrandId, Channel } from '@/lib/constants'
import type { Conversation } from '@/types'
import { HotBadge } from '@/components/gamification/HotBadge'
import { CHANNEL_SVG_ICONS, CHANNEL_ICON_COLORS } from '@/lib/channel-icons'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Props {
  conversation: Conversation
  selected: boolean
  onClick: () => void
}

function ContactAvatar({ name, brandColor }: { name: string; brandColor: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, ${brandColor}cc, ${brandColor})` }}
    >
      {initials || '?'}
    </div>
  )
}

export function ConversationRow({ conversation: conv, selected, onClick }: Props) {
  const brand = BRANDS[conv.brand_id as BrandId]
  const brandColor = brand?.color ?? '#4f7256'
  const hasUnread = conv.unread_count > 0
  const name = conv.contact_name ?? 'Unknown'

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 relative transition-all duration-150"
      style={{
        borderBottom: '1px solid rgba(40,55,44,0.08)',
        background: selected ? 'rgba(2,76,39,0.05)' : undefined,
      }}
      whileHover={{ backgroundColor: 'rgba(2,76,39,0.03)' }}
    >
      {/* Selected left accent */}
      {selected && (
        <motion.div
          layoutId="conv-selected"
          className="absolute left-0 top-2 bottom-2 rounded-r-full"
          style={{ width: 3, background: '#024C27' }}
        />
      )}

      {/* Avatar + channel badge */}
      <div className="relative shrink-0 mt-0.5">
        <ContactAvatar name={name} brandColor={brandColor} />
        <span
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm [&>svg]:w-2.5 [&>svg]:h-2.5"
          style={{
            backgroundColor: `${CHANNEL_ICON_COLORS[conv.channel as Channel]}18`,
            border: '1.5px solid white',
          }}
        >
          {CHANNEL_SVG_ICONS[conv.channel as Channel]}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pl-1">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="text-[13px] truncate"
              style={{
                color: hasUnread ? '#024C27' : '#333333',
                fontWeight: hasUnread ? 700 : 500,
              }}
            >
              {name}
            </span>
            <HotBadge waitingSince={conv.waiting_since} />
          </div>
          <span
            className="text-[11px] shrink-0"
            style={{ color: '#8eb093', fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.3px' }}
          >
            {conv.last_message_at
              ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })
              : ''}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <span
            className="text-[10px] uppercase truncate"
            style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.8px', color: '#8eb093' }}
          >
            {brand?.name?.replace('Carisma ', '') ?? conv.brand_id}
          </span>
          {hasUnread && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none shadow-sm shrink-0 ml-1"
              style={{ background: '#024C27' }}
            >
              {conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
