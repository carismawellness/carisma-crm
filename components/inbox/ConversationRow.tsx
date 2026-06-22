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

function ContactAvatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
    >
      {initials || '?'}
    </div>
  )
}

export function ConversationRow({ conversation: conv, selected, onClick }: Props) {
  const brand = BRANDS[conv.brand_id as BrandId]
  const brandColor = brand?.color ?? '#96B2B2'
  const hasUnread = conv.unread_count > 0
  const name = conv.contact_name ?? 'Unknown'

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      className={cn(
        'w-full text-left px-3 py-2.5 border-b border-border/30 transition-all duration-150 relative',
        selected
          ? 'bg-foreground/6 dark:bg-white/5'
          : ''
      )}
    >
      {/* Selected left accent */}
      {selected && (
        <motion.div
          layoutId="conv-selected"
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
          style={{ backgroundColor: brandColor }}
        />
      )}

      <div className="flex items-start gap-2.5 pl-1.5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <ContactAvatar name={name} color={brandColor} />
          {/* Channel badge */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-background"
            style={{ backgroundColor: `${CHANNEL_ICON_COLORS[conv.channel as Channel]}20` }}
          >
            <span className="[&>svg]:w-2.5 [&>svg]:h-2.5">
              {CHANNEL_SVG_ICONS[conv.channel as Channel]}
            </span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={cn(
                  'text-[13px] truncate',
                  hasUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                )}
              >
                {name}
              </span>
              <HotBadge waitingSince={conv.waiting_since} />
            </div>
            <span className="text-[11px] text-muted-foreground/50 shrink-0">
              {conv.last_message_at
                ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })
                : ''}
            </span>
          </div>

          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[11px] text-muted-foreground/50 truncate">
              {brand?.name ?? conv.brand_id}
            </span>
            {hasUnread && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none shadow-sm shrink-0"
                style={{ backgroundColor: brandColor }}
              >
                {conv.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  )
}
