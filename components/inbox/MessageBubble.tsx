import type { Message } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  message: Message
}

export function MessageBubble({ message: msg }: Props) {
  const isOut = msg.direction === 'outbound'

  return (
    <div className={cn('flex gap-2', isOut ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
          isOut
            ? 'bg-gray-900 text-white rounded-tr-sm'
            : 'bg-white text-gray-900 rounded-tl-sm shadow-sm border border-gray-100'
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
        <p
          className={cn(
            'text-xs mt-1.5',
            isOut ? 'text-gray-400' : 'text-gray-400'
          )}
        >
          {format(new Date(msg.sent_at), 'h:mm a')}
        </p>
      </div>
    </div>
  )
}
