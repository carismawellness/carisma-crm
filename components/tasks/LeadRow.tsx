'use client'

import { BRANDS } from '@/lib/constants'
import type { BrandId } from '@/lib/constants'
import type { LeadWithContact } from '@/types'
import { HotBadge } from '@/components/gamification/HotBadge'
import { leadTemperature } from '@/lib/tasks/temperature'
import { motion } from 'framer-motion'

interface Props {
  lead: LeadWithContact
  selected: boolean
  onClick: () => void
}

function fmtEuro(value: number): string {
  return new Intl.NumberFormat('en-MT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0)
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

export function LeadRow({ lead, selected, onClick }: Props) {
  const brand = BRANDS[lead.brand_id as BrandId]
  const brandColor = brand?.color ?? '#4f7256'
  const name = lead.contact?.name ?? lead.name ?? 'Unknown'
  const temp = leadTemperature(lead)
  // Flame appears when an uncontacted open lead has been waiting past threshold.
  const waitingSince =
    lead.status === 'open' && !lead.first_contacted_at
      ? lead.external_created_at ?? lead.created_at
      : null

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
          layoutId="lead-selected"
          className="absolute left-0 top-2 bottom-2 rounded-r-full"
          style={{ width: 3, background: '#024C27' }}
        />
      )}

      {/* Avatar + brand dot */}
      <div className="relative shrink-0 mt-0.5">
        <ContactAvatar name={name} brandColor={brandColor} />
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: brandColor, border: '1.5px solid white' }}
          title={brand?.name ?? lead.brand_id}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pl-1">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="text-[13px] truncate"
              style={{ color: temp === 'hot' ? '#024C27' : '#333333', fontWeight: temp === 'hot' ? 700 : 500 }}
            >
              {name}
            </span>
            <HotBadge waitingSince={waitingSince} />
          </div>
          <span
            className="text-[11px] shrink-0 font-mono"
            style={{ color: '#4f7256' }}
          >
            {fmtEuro(lead.monetary_value)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          {/* Stage chip */}
          {lead.stage?.name && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full truncate max-w-[55%]"
              style={{
                background: 'rgba(2,76,39,0.07)',
                color: '#4f7256',
                fontFamily: "'Novecento Wide', sans-serif",
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {lead.stage.name}
            </span>
          )}
          {/* Source */}
          {(lead.source ?? lead.contact?.source) && (
            <span
              className="text-[10px] uppercase truncate"
              style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.8px', color: '#8eb093' }}
            >
              {lead.source ?? lead.contact?.source}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
