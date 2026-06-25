'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Contact } from '@/types'
import type { BrandId } from '@/lib/constants'

interface Filters {
  brandId?: BrandId | null
  q?: string
  tag?: string
  source?: string
  page?: number
}

// GHL-style smart-list fetch. Debounce is the page's job — pass `q`
// already-debounced and keep this a plain fetch against /api/contacts.
export function useContacts(filters: Filters = {}) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(filters.page ?? 0)
  const [pageSize, setPageSize] = useState(50)
  const [loading, setLoading] = useState(true)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.brandId) params.set('brand', filters.brandId)
    if (filters.q) params.set('q', filters.q)
    if (filters.tag) params.set('tag', filters.tag)
    if (filters.source) params.set('source', filters.source)
    if (filters.page) params.set('page', String(filters.page))

    try {
      const res = await fetch(`/api/contacts?${params}`)
      if (!res.ok) {
        // Don't treat the {error} body as contacts.
        setContacts([])
        setTotal(0)
        return
      }
      const data = await res.json()
      setContacts(Array.isArray(data.contacts) ? data.contacts : [])
      setTotal(data.total ?? 0)
      setPage(data.page ?? 0)
      setPageSize(data.pageSize ?? 50)
    } catch {
      setContacts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters.brandId, filters.q, filters.tag, filters.source, filters.page])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  return { contacts, total, page, pageSize, loading, refetch: fetchContacts }
}
