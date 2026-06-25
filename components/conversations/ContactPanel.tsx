'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import type { BrandId } from '@/lib/constants'
import type { Contact, LeadWithContact } from '@/types'
import {
  User,
  Phone,
  Mail,
  Tag,
  Target,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  conversationId: string | null
}

function fmtEuro(value: number): string {
  return new Intl.NumberFormat('en-MT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const PANEL_BG = {
  background: 'rgba(255,255,255,0.90)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderLeft: '1px solid rgba(40,55,44,0.12)',
} as const

const EYEBROW_STYLE = {
  fontFamily: "'Novecento Wide', sans-serif",
  letterSpacing: '2px',
  color: '#8eb093',
  fontWeight: 700,
} as const

export function ContactPanel({ conversationId }: Props) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [opportunities, setOpportunities] = useState<LeadWithContact[]>([])
  const [loading, setLoading] = useState(false)
  const [noContact, setNoContact] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setContact(null)
      setOpportunities([])
      setNoContact(false)
      if (!conversationId) return

      setLoading(true)
      try {
        // 1) Resolve the unified contact uuid behind this conversation.
        const convRes = await fetch(`/api/conversations/${conversationId}`)
        if (!convRes.ok) {
          if (!cancelled) setNoContact(true)
          return
        }
        const convData = await convRes.json()
        const contactId: string | null = convData?.conversation?.contact_id ?? null
        if (!contactId) {
          if (!cancelled) setNoContact(true)
          return
        }

        // 2) Fetch the contact + their opportunities (ignore conversations
        //    here to avoid echoing the thread list already shown elsewhere).
        const contactRes = await fetch(`/api/contacts/${contactId}`)
        if (!contactRes.ok) {
          if (!cancelled) setNoContact(true)
          return
        }
        const contactData = await contactRes.json()
        if (cancelled) return
        setContact(contactData?.contact ?? null)
        setOpportunities(contactData?.opportunities ?? [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [conversationId])

  if (!conversationId) return null

  // Collapsed rail — a slim chevron to re-open the panel.
  if (collapsed) {
    return (
      <div
        className="shrink-0 flex flex-col items-center pt-4"
        style={{ width: 44, ...PANEL_BG }}
      >
        <motion.button
          type="button"
          onClick={() => setCollapsed(false)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(2,76,39,0.08)', border: '1px solid rgba(40,55,44,0.12)' }}
          aria-label="Show contact panel"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: '#4f7256' }} />
        </motion.button>
      </div>
    )
  }

  return (
    <div className="shrink-0 flex flex-col overflow-hidden" style={{ width: 280, ...PANEL_BG }}>
      {/* Header / collapse control */}
      <div
        className="px-4 py-3 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(40,55,44,0.10)' }}
      >
        <span className="text-[10px] uppercase" style={EYEBROW_STYLE}>
          Contact
        </span>
        <motion.button
          type="button"
          onClick={() => setCollapsed(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ border: '1px solid rgba(40,55,44,0.12)' }}
          aria-label="Hide contact panel"
        >
          <ChevronRight className="w-3.5 h-3.5" style={{ color: '#8eb093' }} />
        </motion.button>
      </div>

      {loading && !contact ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="space-y-2 text-center">
            <div
              className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center animate-pulse"
              style={{ background: 'rgba(2,76,39,0.08)', border: '1px solid rgba(40,55,44,0.12)' }}
            >
              <User className="w-5 h-5" style={{ color: '#8eb093' }} />
            </div>
            <p className="text-[11px] text-muted-foreground/40">Loading contact…</p>
          </div>
        </div>
      ) : noContact || !contact ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="space-y-1 text-center">
            <div
              className="w-12 h-12 rounded-3xl mx-auto flex items-center justify-center"
              style={{ background: 'rgba(2,76,39,0.08)', border: '1px solid rgba(40,55,44,0.12)' }}
            >
              <User className="w-5 h-5" style={{ color: '#8eb093' }} />
            </div>
            <p className="text-[12px] font-medium text-foreground/40 pt-2">No linked contact</p>
            <p className="text-[11px] text-muted-foreground/30">This thread isn’t tied to a contact yet</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={contact.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5"
          >
            {/* Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full shadow-sm shrink-0"
                  style={{ backgroundColor: BRANDS[contact.brand_id as BrandId]?.color ?? '#024C27' }}
                />
                <span
                  className="text-[14px] uppercase tracking-[1px] leading-tight"
                  style={{ fontFamily: "'Trajan Pro', Georgia, serif", color: '#024C27', fontWeight: 700 }}
                >
                  {contact.name ?? 'Unknown'}
                </span>
              </div>

              <div className="space-y-1.5 pl-4">
                {contact.phone && (
                  <ContactRow icon={<Phone className="w-3.5 h-3.5" />} value={contact.phone} href={`tel:${contact.phone}`} />
                )}
                {contact.email && (
                  <ContactRow icon={<Mail className="w-3.5 h-3.5" />} value={contact.email} href={`mailto:${contact.email}`} />
                )}
                {contact.source && (
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: '#8eb093' }}>
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">via {contact.source}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {contact.tags?.length > 0 && (
              <section className="space-y-2">
                <p className="text-[10px] uppercase flex items-center gap-1.5" style={EYEBROW_STYLE}>
                  <Tag className="w-3 h-3" />
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(79,114,86,0.10)',
                        color: '#4f7256',
                        border: '1px solid rgba(79,114,86,0.20)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Opportunities */}
            <section className="space-y-2">
              <p className="text-[10px] uppercase flex items-center gap-1.5" style={EYEBROW_STYLE}>
                <Target className="w-3 h-3" />
                Opportunities
              </p>
              {opportunities.length === 0 ? (
                <p className="text-[12px] text-muted-foreground/40 pl-0.5">No opportunities yet</p>
              ) : (
                <div className="space-y-1.5">
                  {opportunities.map(opp => (
                    <Link
                      key={opp.id}
                      href={`/opportunities?brand=${contact.brand_id}`}
                      className="block px-3 py-2 rounded-xl transition-colors brand-card"
                      style={{ border: '1px solid rgba(40,55,44,0.10)' }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-medium truncate" style={{ color: '#5a4f43' }}>
                          {opp.name ?? opp.contact?.name ?? 'Untitled'}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: '#8eb093' }} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] font-mono" style={{ color: '#4f7256' }}>
                          {fmtEuro(opp.monetary_value)}
                        </span>
                        {opp.stage?.name && (
                          <span className="text-[11px] truncate" style={{ color: '#8eb093' }}>
                            {opp.stage.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

function ContactRow({ icon, value, href }: { icon: React.ReactNode; value: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 text-[12px] transition-colors hover:opacity-70"
      style={{ color: '#5a4f43' }}
    >
      <span className="shrink-0" style={{ color: '#8eb093' }}>
        {icon}
      </span>
      <span className="truncate">{value}</span>
    </a>
  )
}
