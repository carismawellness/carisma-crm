'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LeadWithContact } from '@/types'
import type { BrandId } from '@/lib/constants'

interface Filters {
  brandId?: BrandId | null
  status?: string
  assignedAgentId?: string | null
}

export function useLeads(filters: Filters = {}) {
  const [leads, setLeads] = useState<LeadWithContact[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams()
    if (filters.brandId) params.set('brand_id', filters.brandId)
    if (filters.status) params.set('status', filters.status)
    if (filters.assignedAgentId) params.set('assigned_agent_id', filters.assignedAgentId)

    try {
      const res = await fetch(`/api/leads?${params}`)
      if (!res.ok) {
        // Don't crash on the {error} body when the request fails.
        setLeads([])
        return
      }
      const data = await res.json()
      setLeads(Array.isArray(data.leads) ? data.leads : [])
    } catch {
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [filters.brandId, filters.status, filters.assignedAgentId])

  useEffect(() => {
    fetchLeads()

    const supabase = createClient()
    const channel = supabase
      .channel('crm_leads_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'crm_leads',
      }, () => {
        fetchLeads()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchLeads])

  return { leads, loading, refetch: fetchLeads }
}
