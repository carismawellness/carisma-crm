'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLead } from '@/hooks/useLead'
import { useLeadSla } from '@/hooks/useLeadSla'
import { StageStepper } from './StageStepper'
import { LeadActivityTimeline } from './LeadActivityTimeline'
import { AssignControl } from './AssignControl'
import { XPToast } from '@/components/gamification/XPToast'
import { Confetti } from '@/components/gamification/Confetti'
import { BRANDS, CHANNEL_LABELS } from '@/lib/constants'
import type { BrandId, Channel } from '@/lib/constants'
import { CHANNEL_SVG_ICONS } from '@/lib/channel-icons'
import { isSlaBreached } from '@/lib/tasks/temperature'
import {
  Target,
  Phone,
  StickyNote,
  Trophy,
  XCircle,
  MessageCircle,
  ExternalLink,
  Timer,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  leadId: string | null
  onLeadClosed?: () => void
}

function fmtEuro(value: number): string {
  return new Intl.NumberFormat('en-MT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  open: { background: 'rgba(79,114,86,0.12)', color: '#4f7256' },
  won: { background: 'rgba(2,76,39,0.12)', color: '#024C27' },
  lost: { background: 'rgba(176,128,104,0.14)', color: '#b08068' },
  abandoned: { background: 'rgba(40,55,44,0.08)', color: '#8eb093' },
}

function SlaPill({ slaDueAt }: { slaDueAt: string | null }) {
  const { remainingMs, breached } = useLeadSla(slaDueAt)
  if (remainingMs === null) return null

  const abs = Math.abs(remainingMs)
  const mins = Math.floor(abs / 60_000)
  const secs = Math.floor((abs % 60_000) / 1000)
  const label = `${mins}:${String(secs).padStart(2, '0')}`

  return (
    <span
      className={
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ' +
        (breached ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-emerald-500 bg-emerald-500/10')
      }
    >
      <Timer className="w-3 h-3" />
      {breached ? `-${label}` : label}
    </span>
  )
}

export function LeadDetailPane({ leadId, onLeadClosed }: Props) {
  const { lead, activities, conversations, loading, refetch } = useLead(leadId)
  const [noteMode, setNoteMode] = useState<'call' | 'note' | null>(null)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [xpToast, setXpToast] = useState<{ label: string; xp: number } | null>(null)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    setNoteMode(null)
    setBody('')
    setXpToast(null)
  }, [leadId])

  if (!leadId || (!lead && !loading)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-mesh-light dark:bg-mesh-dark">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div
            className="w-14 h-14 rounded-3xl mx-auto flex items-center justify-center"
            style={{ background: 'rgba(2,76,39,0.08)', border: '1px solid rgba(40,55,44,0.12)' }}
          >
            <Target className="w-6 h-6" style={{ color: '#8eb093' }} />
          </div>
          <div className="space-y-1">
            <p className="text-[14px] font-medium text-foreground/40">No lead selected</p>
            <p className="text-[12px] text-muted-foreground/30">Pick a lead from the queue to get started</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!lead) {
    return <div className="flex-1 bg-mesh-light dark:bg-mesh-dark" />
  }

  const brand = BRANDS[lead.brand_id as BrandId]
  const name = lead.contact?.name ?? lead.name ?? 'Unknown'
  const statusStyle = STATUS_STYLE[lead.status] ?? STATUS_STYLE.open
  const isOpen = lead.status === 'open'

  async function patch(path: string, payload: Record<string, unknown>) {
    setBusy(true)
    await fetch(`/api/leads/${leadId}/${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {})
    setBusy(false)
    refetch()
  }

  async function handleActivity() {
    if (!body.trim() || !noteMode || busy) return
    setBusy(true)
    const res = await fetch(`/api/leads/${leadId}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: noteMode, body }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (data?.xpEarned > 0) {
      setXpToast({ label: noteMode === 'call' ? 'Call logged' : 'Note added', xp: data.xpEarned })
      setTimeout(() => setXpToast(null), 3500)
    }
    setBody('')
    setNoteMode(null)
    refetch()
  }

  async function handleAdvance(stageId: string) {
    await patch('stage', { stageId })
  }

  async function handleAssign(agentId: string) {
    await patch('assign', { agentId })
  }

  async function handleStatus(status: 'won' | 'lost') {
    await fetch(`/api/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {})
    if (status === 'won') {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 2500)
    }
    refetch()
    onLeadClosed?.()
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={leadId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {confetti && <Confetti />}

        {/* Header */}
        <div
          className="px-5 py-3 shrink-0 relative"
          style={{
            background: 'rgba(255,255,255,0.90)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(40,55,44,0.12)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full shadow-sm shrink-0"
                  style={{ backgroundColor: brand?.color ?? '#024C27' }}
                />
                <span
                  className="text-[14px] uppercase tracking-[1px] truncate"
                  style={{ fontFamily: "'Trajan Pro', Georgia, serif", color: '#024C27', fontWeight: 700 }}
                >
                  {name}
                </span>
                {isOpen && isSlaBreached(lead) && <SlaPill slaDueAt={lead.sla_due_at} />}
              </div>
              <div className="flex items-center gap-2 pl-4 flex-wrap">
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: brand?.color ?? '#024C27' }}
                >
                  {brand?.name?.replace('Carisma ', '') ?? lead.brand_id}
                </span>
                <span className="text-[12px] font-mono" style={{ color: '#4f7256' }}>
                  {fmtEuro(lead.monetary_value)}
                </span>
                {(lead.source ?? lead.contact?.source) && (
                  <span className="text-[11px]" style={{ color: '#8eb093' }}>
                    via {lead.source ?? lead.contact?.source}
                  </span>
                )}
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase"
                  style={{
                    ...statusStyle,
                    fontFamily: "'Novecento Wide', sans-serif",
                    letterSpacing: '0.8px',
                  }}
                >
                  {lead.status}
                </span>
              </div>
            </div>
            <AssignControl
              currentAgentId={lead.assigned_agent_id}
              disabled={busy || !isOpen}
              onAssign={handleAssign}
            />
          </div>

          {/* Stage stepper */}
          <div className="mt-3 pl-4">
            <StageStepper
              brandId={lead.brand_id}
              pipelineExternalId={lead.stage?.pipeline_external_id ?? null}
              currentStageId={lead.stage_id}
              disabled={busy || !isOpen}
              onAdvance={handleAdvance}
            />
          </div>
        </div>

        {/* Body: timeline + conversations */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-6 bg-mesh-light dark:bg-mesh-dark">
          {/* Linked conversations */}
          {conversations.length > 0 && (
            <section className="space-y-2">
              <p
                className="text-[10px] uppercase"
                style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2px', color: '#8eb093', fontWeight: 700 }}
              >
                Conversations
              </p>
              <div className="space-y-1.5">
                {conversations.map(conv => (
                  <Link
                    key={conv.id}
                    href={`/?conversation=${conv.id}`}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-colors brand-card"
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
                ))}
              </div>
            </section>
          )}

          {/* Activity timeline */}
          <section className="space-y-2">
            <p
              className="text-[10px] uppercase"
              style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '2px', color: '#8eb093', fontWeight: 700 }}
            >
              Activity
            </p>
            <LeadActivityTimeline activities={activities} />
          </section>
        </div>

        {/* Action bar */}
        <div
          className="shrink-0 p-4 space-y-3"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(40,55,44,0.10)',
          }}
        >
          <AnimatePresence>
            {xpToast && <XPToast label={xpToast.label} xp={xpToast.xp} />}
          </AnimatePresence>

          {noteMode && (
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={noteMode === 'call' ? 'Log call outcome...' : 'Write a note...'}
              autoFocus
              className="w-full min-h-[80px] resize-none text-[13px] rounded-xl px-3 py-2 outline-none transition-all"
              style={{ background: 'rgba(40,55,44,0.05)', color: '#5a4f43', border: '1px solid rgba(40,55,44,0.10)' }}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleActivity()
                }
              }}
            />
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <ActionButton
                icon={<Phone className="w-3.5 h-3.5" />}
                label="Log call"
                active={noteMode === 'call'}
                disabled={busy}
                onClick={() => setNoteMode(m => (m === 'call' ? null : 'call'))}
              />
              <ActionButton
                icon={<StickyNote className="w-3.5 h-3.5" />}
                label="Add note"
                active={noteMode === 'note'}
                disabled={busy}
                onClick={() => setNoteMode(m => (m === 'note' ? null : 'note'))}
              />
              {isOpen && (
                <>
                  <ActionButton
                    icon={<Trophy className="w-3.5 h-3.5" />}
                    label="Won"
                    disabled={busy}
                    tone="win"
                    onClick={() => handleStatus('won')}
                  />
                  <ActionButton
                    icon={<XCircle className="w-3.5 h-3.5" />}
                    label="Lost"
                    disabled={busy}
                    tone="lose"
                    onClick={() => handleStatus('lost')}
                  />
                </>
              )}
            </div>

            {noteMode && (
              <motion.button
                onClick={handleActivity}
                disabled={busy || !body.trim()}
                whileHover={!busy && body.trim() ? { scale: 1.02 } : undefined}
                whileTap={!busy && body.trim() ? { scale: 0.98 } : undefined}
                className="cta-glow flex items-center gap-1.5 px-5 py-1.5 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1.5px', textTransform: 'uppercase' }}
              >
                Save
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function ActionButton({
  icon,
  label,
  active,
  disabled,
  tone,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  tone?: 'win' | 'lose'
  onClick: () => void
}) {
  const baseColor = tone === 'win' ? '#024C27' : tone === 'lose' ? '#b08068' : '#4f7256'
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all disabled:opacity-40"
      style={{
        border: `1px solid ${baseColor}66`,
        background: active ? baseColor : 'transparent',
        color: active ? '#ffffff' : baseColor,
        fontFamily: "'Novecento Wide', sans-serif",
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}
    >
      {icon}
      {label}
    </motion.button>
  )
}
