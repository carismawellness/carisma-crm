'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Contact, Conversation, LeadWithContact } from '@/types'

// Single unified-contact detail: the person + their chat threads + their leads.
// null id -> idle (no fetch, empty everything).
export function useContact(id: string | null) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [opportunities, setOpportunities] = useState<LeadWithContact[]>([])
  const [loading, setLoading] = useState(false)

  const fetchContact = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/contacts/${id}`)
      if (!res.ok) {
        // 404/401/etc — don't treat the {error} body as a contact.
        setContact(null)
        setConversations([])
        setOpportunities([])
        return
      }
      const data = await res.json()
      setContact(data?.contact ?? null)
      setConversations(data?.conversations ?? [])
      setOpportunities(data?.opportunities ?? [])
    } catch {
      setContact(null)
      setConversations([])
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) {
      setContact(null)
      setConversations([])
      setOpportunities([])
      return
    }
    fetchContact()
  }, [id, fetchContact])

  return { contact, conversations, opportunities, loading, refetch: fetchContact }
}
