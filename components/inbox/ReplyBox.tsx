'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { XPToast } from '@/components/gamification/XPToast'
import { Confetti } from '@/components/gamification/Confetti'
import { calculateReplyXp } from '@/lib/gamification/xp'
import { Sparkles, RefreshCw, Send, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  conversationId: string
  onSent: () => void
  onClosed: () => void
}

export function ReplyBox({ conversationId, onSent, onClosed }: Props) {
  const [draft, setDraft] = useState('')
  const [loadingDraft, setLoadingDraft] = useState(false)
  const [sending, setSending] = useState(false)
  const [xpToast, setXpToast] = useState<{ label: string; xp: number } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const loadDraft = () => {
    setLoadingDraft(true)
    fetch('/api/ai/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversationId }),
    })
      .then(r => r.json())
      .then(d => { if (d.draft) setDraft(d.draft) })
      .catch(() => {})
      .finally(() => setLoadingDraft(false))
  }

  useEffect(() => {
    if (!conversationId) return
    setDraft('')
    setXpToast(null)
    loadDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  async function handleSend() {
    if (!draft.trim() || sending) return
    setSending(true)
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversationId, body: draft }),
    })
    const data = await res.json()
    setSending(false)

    if (data.responseTimeMs) {
      const xp = calculateReplyXp(data.responseTimeMs)
      if (xp > 0) {
        const mins = Math.floor(data.responseTimeMs / 60_000)
        const secs = Math.floor((data.responseTimeMs % 60_000) / 1000)
        const speedLabel = xp >= 20 ? `Lightning — ${mins}m ${secs}s` : `Fast — ${mins}m ${secs}s`
        setXpToast({ label: speedLabel, xp })
        setTimeout(() => setXpToast(null), 3500)
      }
    }
    setDraft('')
    onSent()
    loadDraft()
  }

  async function handleClose() {
    await fetch(`/api/conversations/${conversationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    })
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2500)
    setDraft('')
    onClosed()
  }

  return (
    <div className="shrink-0 glass border-t border-border/40 p-4 space-y-3">
      {showConfetti && <Confetti />}
      <AnimatePresence>
        {xpToast && <XPToast label={xpToast.label} xp={xpToast.xp} />}
      </AnimatePresence>

      {/* AI header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            AI Draft
          </span>
        </div>
        <motion.button
          onClick={loadDraft}
          disabled={loadingDraft}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="text-muted-foreground/50 hover:text-muted-foreground disabled:opacity-30 transition-colors"
          aria-label="Regenerate draft"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Textarea */}
      <Textarea
        value={loadingDraft ? '' : draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={loadingDraft ? 'Generating reply...' : 'Edit reply or type your own...'}
        className={cn(
          'min-h-[90px] resize-none text-[13px] bg-background/50 border-border/50',
          'focus:ring-1 focus:ring-foreground/20 transition-all rounded-xl',
          loadingDraft && 'opacity-50'
        )}
        disabled={loadingDraft}
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleSend()
          }
        }}
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all border border-border/60"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolve
          </motion.button>
          <span className="text-[10px] text-muted-foreground/30 font-mono">⌘ Enter to send</span>
        </div>

        <motion.button
          onClick={handleSend}
          disabled={sending || !draft.trim() || loadingDraft}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all',
            'bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-200 dark:to-white',
            'text-white dark:text-slate-900',
            'shadow-sm hover:shadow-md',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <Send className="w-3.5 h-3.5" />
          {sending ? 'Sending' : 'Send'}
        </motion.button>
      </div>
    </div>
  )
}
