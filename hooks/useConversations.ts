'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Conversation } from '@/types'
import type { BrandId, Channel } from '@/lib/constants'

interface Filters {
  brand?: BrandId | null
  channel?: Channel | null
  status?: string
}

export function useConversations(filters: Filters = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    const params = new URLSearchParams()
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.channel) params.set('channel', filters.channel)
    if (filters.status) params.set('status', filters.status)

    const res = await fetch(`/api/conversations?${params}`)
    const data = await res.json()
    setConversations(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filters.brand, filters.channel, filters.status])

  useEffect(() => {
    fetchConversations()

    const supabase = createClient()
    const channel = supabase
      .channel('crm_conversations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'crm_conversations',
      }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchConversations])

  return { conversations, loading, refetch: fetchConversations }
}
