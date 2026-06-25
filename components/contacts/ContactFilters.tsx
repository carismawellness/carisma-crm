'use client'

import { Search, Tag, Radio } from 'lucide-react'

export interface ContactFilterValues {
  q: string
  tag: string
  source: string
}

interface Props {
  values: ContactFilterValues
  onChange: (next: ContactFilterValues) => void
}

// Smart-list filters. Brand is owned by the shell top bar (?brand=) — only
// search / tag / source live here. Search is raw text; the table debounces it.
export function ContactFilters({ values, onChange }: Props) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 shrink-0 flex-wrap"
      style={{ borderBottom: '1px solid rgba(40,55,44,0.10)', background: 'rgba(255,255,255,0.70)' }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
          style={{ color: '#8eb093' }}
        />
        <input
          type="search"
          value={values.q}
          onChange={e => onChange({ ...values, q: e.target.value })}
          placeholder="Search name, phone, email..."
          className="w-full text-[13px] rounded-xl pl-8 pr-3 py-2 outline-none transition-all"
          style={{
            background: 'rgba(40,55,44,0.05)',
            color: '#5a4f43',
            border: '1px solid rgba(40,55,44,0.10)',
          }}
        />
      </div>

      {/* Tag */}
      <div className="relative">
        <Tag
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
          style={{ color: '#8eb093' }}
        />
        <input
          type="text"
          value={values.tag}
          onChange={e => onChange({ ...values, tag: e.target.value })}
          placeholder="Tag"
          className="w-32 text-[13px] rounded-xl pl-8 pr-3 py-2 outline-none transition-all"
          style={{
            background: 'rgba(40,55,44,0.05)',
            color: '#5a4f43',
            border: '1px solid rgba(40,55,44,0.10)',
          }}
        />
      </div>

      {/* Source */}
      <div className="relative">
        <Radio
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
          style={{ color: '#8eb093' }}
        />
        <input
          type="text"
          value={values.source}
          onChange={e => onChange({ ...values, source: e.target.value })}
          placeholder="Source"
          className="w-32 text-[13px] rounded-xl pl-8 pr-3 py-2 outline-none transition-all"
          style={{
            background: 'rgba(40,55,44,0.05)',
            color: '#5a4f43',
            border: '1px solid rgba(40,55,44,0.10)',
          }}
        />
      </div>
    </div>
  )
}
