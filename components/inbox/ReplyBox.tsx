'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { XPToast } from '@/components/gamification/XPToast'
import { Confetti } from '@/components/gamification/Confetti'
import { calculateReplyXp } from '@/lib/gamification/xp'

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
        const speedLabel =
          xp >= 20
            ? `⚡ Lightning — ${mins}m ${secs}s`
            : `🚀 Fast — ${mins}m ${secs}s`
        setXpToast({ label: speedLabel, xp })
        setTimeout(() => setXpToast(null), 3500)
      }
    }

    setDraft('')
    onSent()
    // Reload draft for next reply
    loadDraft()
  }

  async function handleClose() {
    await fetch(`/api/conversations/${conversationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    })

    // Award close XP
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2500)

    setDraft('')
    onClosed()
  }

  return (
    <div className="border-t bg-white p-4 space-y-3 shrink-0">
      {showConfetti && <Confetti />}
      {xpToast && <XPToast label={xpToast.label} xp={xpToast.xp} />}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-purple-600">✨ AI Draft</span>
          <button
            onClick={loadDraft}
            disabled={loadingDraft}
            className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          >
            🔄 Regenerate
          </button>
        </div>
        <Textarea
          value={loadingDraft ? '' : draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={loadingDraft ? 'Drafting reply...' : 'Type a reply...'}
          className="min-h-[100px] resize-none text-sm"
          disabled={loadingDraft}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <p className="text-xs text-gray-400">⌘ Enter to send</p>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✓ Close
        </Button>
        <Button
          onClick={handleSend}
          disabled={sending || !draft.trim() || loadingDraft}
          className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send →'}
        </Button>
      </div>
    </div>
  )
}
