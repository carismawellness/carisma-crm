'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useContacts } from '@/hooks/useContacts'
import { ContactRow } from './ContactRow'
import type { ContactFilterValues } from './ContactFilters'
import type { BrandId } from '@/lib/constants'
import { Users, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  filters: ContactFilterValues
  selected: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (ids: string[], allChecked: boolean) => void
  onOpen: (id: string) => void
}

const COLUMNS = ['', 'Name', 'Phone', 'Email', 'Tags', 'Source', 'Brand', 'Created']

function HeaderCell({ label }: { label: string }) {
  return (
    <th
      className="px-3 py-2 text-left text-[10px] uppercase font-bold whitespace-nowrap"
      style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1.2px', color: '#8eb093' }}
    >
      {label}
    </th>
  )
}

export function ContactsTable({ filters, selected, onToggle, onToggleAll, onOpen }: Props) {
  const params = useSearchParams()
  const brand = (params.get('brand') as BrandId | null) ?? null

  // Debounce the search input (300ms) before it hits the fetch.
  const [debouncedQ, setDebouncedQ] = useState(filters.q)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 300)
    return () => clearTimeout(t)
  }, [filters.q])

  const [page, setPage] = useState(0)
  // Any filter change resets to the first page.
  useEffect(() => {
    setPage(0)
  }, [brand, debouncedQ, filters.tag, filters.source])

  const { contacts, total, pageSize, loading } = useContacts({
    brandId: brand,
    q: debouncedQ,
    tag: filters.tag || undefined,
    source: filters.source || undefined,
    page,
  })

  const pageIds = contacts.map(c => c.id)
  const allChecked = pageIds.length > 0 && pageIds.every(id => selected.has(id))

  const from = total === 0 ? 0 : page * pageSize + 1
  const to = Math.min(total, page * pageSize + contacts.length)
  const hasPrev = page > 0
  const hasNext = (page + 1) * pageSize < total

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Scroll area */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead
            className="sticky top-0 z-10"
            style={{
              background: 'rgba(250,250,248,0.95)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 1px 0 rgba(40,55,44,0.10)',
            }}
          >
            <tr>
              <th className="px-3 py-2 w-9">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => onToggleAll(pageIds, allChecked)}
                  className="w-3.5 h-3.5 rounded cursor-pointer accent-[#024C27]"
                />
              </th>
              {COLUMNS.slice(1).map(c => (
                <HeaderCell key={c} label={c} />
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(40,55,44,0.07)' }}>
                  {COLUMNS.map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div
                        className="h-3 rounded-full animate-pulse"
                        style={{ background: 'rgba(79,114,86,0.10)', width: j === 0 ? 14 : '70%' }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length}>
                  <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(2,76,39,0.06)' }}
                    >
                      <Users className="w-6 h-6" style={{ color: '#8eb093' }} />
                    </div>
                    <div className="space-y-1">
                      <p
                        className="text-[12px] uppercase font-bold"
                        style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1.5px', color: '#8eb093' }}
                      >
                        No contacts
                      </p>
                      <p className="text-[11px]" style={{ color: '#8eb093' }}>
                        Try a different search or filter
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map(contact => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  checked={selected.has(contact.id)}
                  onToggle={onToggle}
                  onOpen={onOpen}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ borderTop: '1px solid rgba(40,55,44,0.10)', background: 'rgba(255,255,255,0.70)' }}
      >
        <span
          className="text-[11px] uppercase"
          style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1px', color: '#8eb093' }}
        >
          {from}–{to} of {total}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => hasPrev && setPage(p => p - 1)}
            disabled={!hasPrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              border: '1px solid rgba(79,114,86,0.40)',
              color: '#4f7256',
              fontFamily: "'Novecento Wide', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <button
            type="button"
            onClick={() => hasNext && setPage(p => p + 1)}
            disabled={!hasNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              border: '1px solid rgba(79,114,86,0.40)',
              color: '#4f7256',
              fontFamily: "'Novecento Wide', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
