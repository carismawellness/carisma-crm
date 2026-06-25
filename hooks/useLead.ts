'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LeadDetail, LeadActivity, Conversation } from '@/types'

export function useLead(leadId: string | null) {
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLead = useCallback(async () => {
    if (!leadId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${leadId}`)
      if (!res.ok) {
        // 404/401/etc — don't treat the {error} body as a LeadDetail.
        setLead(null)
        setActivities([])
        setConversations([])
        return
      }
      const data = await res.json()
      setLead(data ?? null)
      setActivities(data?.activities ?? [])
      setConversations(data?.conversations ?? [])
    } catch {
      setLead(null)
      setActivities([])
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    if (!leadId) {
      setLead(null)
      setActivities([])
      setConversations([])
      return
    }
    fetchLead()

    const supabase = createClient()
    const channel = supabase
      .channel(`crm_lead_activities:${leadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'crm_lead_activities',
        filter: `lead_id=eq.${leadId}`,
      }, (payload) => {
        setActivities(prev => [...prev, payload.new as LeadActivity])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [leadId, fetchLead])

  return { lead, activities, conversations, loading, refetch: fetchLead }
}
