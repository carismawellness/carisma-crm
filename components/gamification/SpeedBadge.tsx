import type { SpeedRating } from '@/types'
import { cn } from '@/lib/utils'

const CONFIG: Record<SpeedRating, { label: string; className: string }> = {
  lightning: {
    label: '⚡ Lightning',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  fast: {
    label: '🚀 Fast',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  slow: {
    label: '🐢 Slow',
    className: 'bg-gray-50 text-gray-500 border-gray-200',
  },
}

interface Props {
  rating: SpeedRating
}

export function SpeedBadge({ rating }: Props) {
  const { label, className } = CONFIG[rating]
  return (
    <span
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-full border',
        className
      )}
    >
      {label}
    </span>
  )
}
