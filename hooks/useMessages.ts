'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, Conversation } from '@/types'

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return
    setLoading(true)
    const res = await fetch(`/api/conversations/${conversationId}`)
    const data = await res.json()
    setConversation(data.conversation ?? null)
    setMessages(data.messages ?? [])
    setLoading(false)
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setConversation(null)
      return
    }
    fetchMessages()

    const supabase = createClient()
    const channel = supabase
      .channel(`crm_messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'crm_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, fetchMessages])

  return { messages, conversation, loading, refetch: fetchMessages }
}
