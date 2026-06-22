import type { Message } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Props {
  message: Message
}

export function MessageBubble({ message: msg }: Props) {
  const isOut = msg.direction === 'outbound'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={cn('flex gap-2 px-1', isOut ? 'flex-row-reverse' : 'flex-row')}
    >
      <div className={cn('max-w-[72%]', isOut ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
        <div
          className={cn(
            'px-4 py-2.5 text-[13px] leading-relaxed break-words',
            isOut
              ? 'text-white rounded-2xl rounded-tr-md shadow-md'
              : 'text-foreground rounded-2xl rounded-tl-md'
          )}
          style={isOut
            ? { background: 'linear-gradient(135deg, #024C27 0%, #124E59 100%)' }
            : {
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(40,55,44,0.10)',
                boxShadow: '0 2px 8px rgba(40,55,44,0.08)',
              }
          }
        >
          <p className="whitespace-pre-wrap">{msg.body}</p>
        </div>
        <span className="text-[10px] text-muted-foreground/40 px-1">
          {format(new Date(msg.sent_at), 'h:mm a')}
        </span>
      </div>
    </motion.div>
  )
}
