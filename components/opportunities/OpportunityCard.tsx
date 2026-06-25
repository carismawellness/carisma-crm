'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BRANDS } from '@/lib/constants'
import type { BrandId } from '@/lib/constants'
import type { LeadWithContact } from '@/types'
import { HotBadge } from '@/components/gamification/HotBadge'
import { isSlaBreached } from '@/lib/tasks/temperature'

interface Props {
  lead: LeadWithContact
  onOpen: (leadId: string) => void
}

function fmtEuro(value: number): string {
  return new Intl.NumberFormat('en-MT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function OpportunityCard({ lead, onOpen }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const brand = BRANDS[lead.brand_id as BrandId]
  const brandColor = brand?.color ?? '#4f7256'
  const name = lead.contact?.name ?? lead.name ?? 'Unknown'
  const value = lead.monetary_value || 0
  const source = lead.source ?? lead.contact?.source
  const hot = isSlaBreached(lead)
  // Flame badge mirrors LeadRow: an uncontacted open lead past the threshold.
  const waitingSince =
    lead.status === 'open' && !lead.first_contacted_at
      ? lead.external_created_at ?? lead.created_at
      : null

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: 'rgba(255,255,255,0.92)',
    border: `1px solid ${hot ? 'rgba(226,87,76,0.35)' : 'rgba(40,55,44,0.10)'}`,
    boxShadow: isDragging
      ? '0 8px 24px rgba(2,76,39,0.18)'
      : '0 1px 2px rgba(40,55,44,0.06)',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(lead.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(lead.id)
        }
      }}
      className="brand-card cursor-grab active:cursor-grabbing rounded-2xl px-3 py-2.5 select-none transition-shadow"
    >
      {/* Name + hot badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="text-[13px] truncate"
            style={{ color: hot ? '#024C27' : '#333333', fontWeight: hot ? 700 : 600 }}
          >
            {name}
          </span>
          <HotBadge waitingSince={waitingSince} />
        </div>
        {value > 0 && (
          <span className="text-[11px] shrink-0 font-mono" style={{ color: '#4f7256' }}>
            {fmtEuro(value)}
          </span>
        )}
      </div>

      {/* Source chip + owner avatar */}
      <div className="flex items-center justify-between gap-2 mt-2">
        {source ? (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full truncate max-w-[70%] uppercase"
            style={{
              background: 'rgba(2,76,39,0.07)',
              color: '#4f7256',
              fontFamily: "'Novecento Wide', sans-serif",
              letterSpacing: '0.6px',
            }}
          >
            {source}
          </span>
        ) : (
          <span />
        )}

        {lead.assigned_agent_id && (
          <span
            className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${brandColor}cc, ${brandColor})` }}
            title="Owner"
          >
            {initials(name) || '?'}
          </span>
        )}
      </div>
    </div>
  )
}
