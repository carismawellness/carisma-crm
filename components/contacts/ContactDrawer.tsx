'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useContact } from '@/hooks/useContact'
import { BRANDS, CHANNEL_LABELS } from '@/lib/constants'
import type { BrandId, Channel } from '@/lib/constants'
import { CHANNEL_SVG_ICONS } from '@/lib/channel-icons'
import {
  X,
  Phone,
  Mail,
  Radio,
  Tag,
  MessageCircle,
  Target,
  ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  contactId: string | null
  onClose: () => void
}

type Tab = 'overview' | 'conversations' | 'opportunities'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'opportunities', label: 'Opportunities' },
]

function fmtEuro(value: number): string {
  return new Intl.NumberFormat('en-MT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] uppercase"
      style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2px', color: '#8eb093', fontWeight: 700 }}
    >
      {children}
    </p>
  )
}

export function ContactDrawer({ contactId, onClose }: Props) {
  const { contact, conversations, opportunities, loading } = useContact(contactId)
  const [tab, setTab] = useState<Tab>('overview')

  // Reset to overview each time a new contact opens.
  useEffect(() => {
    setTab('overview')
  }, [contactId])

  // Close on Escape.
  useEffect(() => {
    if (!contactId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [contactId, onClose])

  const open = !!contactId
  const brand = contact ? BRANDS[contact.brand_id as BrandId] : null
  const brandColor = brand?.color ?? '#024C27'
  const brandQuery = contact?.brand_id ?? ''

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(40,55,44,0.30)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Slide-over */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-50 w-[440px] max-w-[92vw] flex flex-col overflow-hidden glass"
            style={{ borderLeft: '1px solid rgba(40,55,44,0.12)', background: '#fafaf8' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 shrink-0 relative"
              style={{
                background: 'rgba(255,255,255,0.90)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderBottom: '1px solid rgba(40,55,44,0.12)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-[12px] font-bold text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${brandColor}cc, ${brandColor})` }}
                  >
                    {(contact?.name ?? '?')
                      .split(' ')
                      .map(w => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p
                      className="text-[15px] truncate"
                      style={{ fontFamily: "'Trajan Pro', Georgia, serif", color: '#024C27', fontWeight: 700 }}
                    >
                      {contact?.name ?? (loading ? 'Loading…' : 'Unknown')}
                    </p>
                    {brand && (
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase"
                        style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1px', color: '#8eb093' }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                        {brand.name.replace('Carisma ', '')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(40,55,44,0.06)', color: '#5a4f43' }}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 mt-4">
                {TABS.map(t => {
                  const active = tab === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className="relative px-3 py-1.5 text-[11px] font-bold transition-colors"
                      style={{
                        fontFamily: "'Novecento Wide', sans-serif",
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        color: active ? '#024C27' : '#8eb093',
                      }}
                    >
                      {t.label}
                      {active && (
                        <motion.div
                          layoutId="contact-tab"
                          className="absolute left-2 right-2 -bottom-0.5 h-0.5 rounded-full"
                          style={{ background: '#024C27' }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
              {tab === 'overview' && (
                <div className="space-y-4">
                  <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone" value={contact?.phone} />
                  <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={contact?.email} />
                  <DetailRow icon={<Radio className="w-4 h-4" />} label="Source" value={contact?.source} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2" style={{ color: '#8eb093' }}>
                      <Tag className="w-4 h-4" />
                      <SectionLabel>Tags</SectionLabel>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pl-6">
                      {(contact?.tags ?? []).length === 0 ? (
                        <span className="text-[12px]" style={{ color: '#8eb093' }}>No tags</span>
                      ) : (
                        (contact?.tags ?? []).map(t => (
                          <span
                            key={t}
                            className="text-[11px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(79,114,86,0.12)', color: '#4f7256' }}
                          >
                            {t}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'conversations' && (
                <div className="space-y-2">
                  {loading ? (
                    <DrawerLoading label="Loading conversations…" />
                  ) : conversations.length === 0 ? (
                    <EmptyState icon={<MessageCircle className="w-5 h-5" />} label="No conversations" />
                  ) : (
                    conversations.map(conv => (
                      <Link
                        key={conv.id}
                        href={`/?c=${conv.id}&brand=${brandQuery}`}
                        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-colors brand-card"
                        style={{ border: '1px solid rgba(40,55,44,0.10)' }}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 shrink-0">
                            {CHANNEL_SVG_ICONS[conv.channel as Channel] ?? <MessageCircle className="w-3.5 h-3.5" />}
                          </span>
                          <span className="text-[12px] truncate" style={{ color: '#5a4f43' }}>
                            {CHANNEL_LABELS[conv.channel as Channel] ?? conv.channel}
                          </span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: '#8eb093' }} />
                      </Link>
                    ))
                  )}
                </div>
              )}

              {tab === 'opportunities' && (
                <div className="space-y-2">
                  {loading ? (
                    <DrawerLoading label="Loading opportunities…" />
                  ) : opportunities.length === 0 ? (
                    <EmptyState icon={<Target className="w-5 h-5" />} label="No opportunities" />
                  ) : (
                    opportunities.map(opp => (
                      <Link
                        key={opp.id}
                        href={`/opportunities?brand=${brandQuery}`}
                        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-colors brand-card"
                        style={{ border: '1px solid rgba(40,55,44,0.10)' }}
                      >
                        <span className="min-w-0 space-y-0.5">
                          <span className="block text-[12px] truncate" style={{ color: '#333333', fontWeight: 500 }}>
                            {opp.name ?? opp.contact?.name ?? 'Opportunity'}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="text-[11px] font-mono" style={{ color: '#4f7256' }}>
                              {fmtEuro(opp.monetary_value)}
                            </span>
                            {opp.stage?.name && (
                              <span
                                className="text-[10px] uppercase"
                                style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.6px', color: '#8eb093' }}
                              >
                                {opp.stage.name}
                              </span>
                            )}
                          </span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: '#8eb093' }} />
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2" style={{ color: '#8eb093' }}>
        {icon}
        <SectionLabel>{label}</SectionLabel>
      </div>
      <p className="text-[13px] pl-6" style={{ color: value ? '#5a4f43' : '#8eb093' }}>
        {value || '—'}
      </p>
    </div>
  )
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center [&>svg]:text-[#8eb093]"
        style={{ background: 'rgba(2,76,39,0.06)' }}
      >
        {icon}
      </div>
      <p
        className="text-[11px] uppercase font-bold"
        style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1.5px', color: '#8eb093' }}
      >
        {label}
      </p>
    </div>
  )
}

function DrawerLoading({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
      <div className="w-7 h-7 rounded-full border-2 border-[#024C27]/15 border-t-[#4f7256] animate-spin" />
      <p
        className="text-[11px] uppercase font-bold"
        style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1.5px', color: '#8eb093' }}
      >
        {label}
      </p>
    </div>
  )
}
