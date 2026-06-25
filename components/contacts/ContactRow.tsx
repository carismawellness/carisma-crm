'use client'

import { BRANDS } from '@/lib/constants'
import type { BrandId } from '@/lib/constants'
import type { Contact } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'

interface Props {
  contact: Contact
  checked: boolean
  onToggle: (id: string) => void
  onOpen: (id: string) => void
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
      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, ${brandColor}cc, ${brandColor})` }}
    >
      {initials || '?'}
    </div>
  )
}

export function ContactRow({ contact, checked, onToggle, onOpen }: Props) {
  const brand = BRANDS[contact.brand_id as BrandId]
  const brandColor = brand?.color ?? '#4f7256'
  const name = contact.name ?? 'Unknown'
  const tags = contact.tags ?? []
  const shownTags = tags.slice(0, 2)
  const extraTags = tags.length - shownTags.length

  return (
    <motion.tr
      onClick={() => onOpen(contact.id)}
      className="cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid rgba(40,55,44,0.07)' }}
      whileHover={{ backgroundColor: 'rgba(2,76,39,0.03)' }}
    >
      {/* Checkbox */}
      <td className="px-3 py-2.5 w-9" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(contact.id)}
          className="w-3.5 h-3.5 rounded cursor-pointer accent-[#024C27]"
        />
      </td>

      {/* Avatar + Name */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <ContactAvatar name={name} brandColor={brandColor} />
          <span className="text-[13px] font-medium truncate" style={{ color: '#333333' }}>
            {name}
          </span>
        </div>
      </td>

      {/* Phone */}
      <td className="px-3 py-2.5">
        <span className="text-[12px]" style={{ color: '#5a4f43' }}>
          {contact.phone ?? '—'}
        </span>
      </td>

      {/* Email */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] truncate block max-w-[200px]" style={{ color: '#5a4f43' }}>
          {contact.email ?? '—'}
        </span>
      </td>

      {/* Tags */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1 flex-wrap">
          {shownTags.length === 0 ? (
            <span className="text-[12px]" style={{ color: '#8eb093' }}>—</span>
          ) : (
            shownTags.map(tag => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full truncate max-w-[90px]"
                style={{ background: 'rgba(79,114,86,0.12)', color: '#4f7256' }}
              >
                {tag}
              </span>
            ))
          )}
          {extraTags > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(40,55,44,0.06)', color: '#8eb093' }}
            >
              +{extraTags}
            </span>
          )}
        </div>
      </td>

      {/* Source */}
      <td className="px-3 py-2.5">
        <span className="text-[12px]" style={{ color: '#5a4f43' }}>
          {contact.source ?? '—'}
        </span>
      </td>

      {/* Brand */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: brandColor }}
          />
          <span
            className="text-[10px] uppercase"
            style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.8px', color: '#8eb093' }}
          >
            {brand?.name?.replace('Carisma ', '') ?? contact.brand_id}
          </span>
        </div>
      </td>

      {/* Created (relative) */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span
          className="text-[11px]"
          style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.3px', color: '#8eb093' }}
        >
          {contact.created_at
            ? formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })
            : ''}
        </span>
      </td>
    </motion.tr>
  )
}
