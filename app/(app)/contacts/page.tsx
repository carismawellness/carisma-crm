'use client'

import { Suspense, useState } from 'react'
import { ContactFilters, type ContactFilterValues } from '@/components/contacts/ContactFilters'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { ContactDrawer } from '@/components/contacts/ContactDrawer'
import { Lock } from 'lucide-react'

const EMPTY_FILTERS: ContactFilterValues = { q: '', tag: '', source: '' }

// GHL smart-list: filters + paginated table + slide-over detail drawer.
// Brand is owned by the shell top bar (?brand=) and read inside ContactsTable.
function ContactsInner() {
  const [filters, setFilters] = useState<ContactFilterValues>(EMPTY_FILTERS)
  const [openId, setOpenId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll(ids: string[], allChecked: boolean) {
    setSelected(prev => {
      const next = new Set(prev)
      if (allChecked) ids.forEach(id => next.delete(id))
      else ids.forEach(id => next.add(id))
      return next
    })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter bar + bulk-action affordance */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex-1 min-w-0">
          <ContactFilters values={filters} onChange={setFilters} />
        </div>
        {selected.size > 0 && (
          <div className="pr-4">
            <button
              type="button"
              disabled
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold opacity-50 cursor-not-allowed"
              style={{
                border: '1px solid rgba(79,114,86,0.40)',
                color: '#4f7256',
                fontFamily: "'Novecento Wide', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              <Lock className="w-3.5 h-3.5" />
              Actions ({selected.size})
            </button>
          </div>
        )}
      </div>

      <ContactsTable
        filters={filters}
        selected={selected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onOpen={setOpenId}
      />

      <ContactDrawer contactId={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={null}>
      <ContactsInner />
    </Suspense>
  )
}
