'use client'

import type { LeadActivity, LeadActivityType } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import {
  Phone,
  StickyNote,
  ArrowRightCircle,
  UserCheck,
  Flag,
  Sparkles,
} from 'lucide-react'

interface Props {
  activities: LeadActivity[]
}

const ACTIVITY_META: Record<LeadActivityType, { icon: React.ReactNode; label: string; color: string }> = {
  call: { icon: <Phone className="w-3 h-3" />, label: 'Call', color: '#4f7256' },
  note: { icon: <StickyNote className="w-3 h-3" />, label: 'Note', color: '#978063' },
  stage_change: { icon: <ArrowRightCircle className="w-3 h-3" />, label: 'Stage', color: '#024C27' },
  assignment: { icon: <UserCheck className="w-3 h-3" />, label: 'Assigned', color: '#6391AB' },
  status_change: { icon: <Flag className="w-3 h-3" />, label: 'Status', color: '#b08068' },
  system: { icon: <Sparkles className="w-3 h-3" />, label: 'System', color: '#8eb093' },
}

export function LeadActivityTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="text-center text-[13px] text-muted-foreground/30 pt-10">
        No activity yet
      </div>
    )
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <div className="space-y-3">
      {sorted.map(activity => {
        const meta = ACTIVITY_META[activity.type] ?? ACTIVITY_META.system
        return (
          <div key={activity.id} className="flex items-start gap-2.5">
            <span
              className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: `${meta.color}18`, color: meta.color }}
            >
              {meta.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] uppercase"
                  style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1px', color: meta.color, fontWeight: 700 }}
                >
                  {meta.label}
                </span>
                <span className="text-[10px] shrink-0" style={{ color: '#8eb093' }}>
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
              {activity.body && (
                <p className="text-[12px] mt-0.5 whitespace-pre-wrap break-words" style={{ color: '#5a4f43' }}>
                  {activity.body}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
