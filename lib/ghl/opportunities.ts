const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_VERSION = '2021-07-28'

function getHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_VERSION,
    'Content-Type': 'application/json',
  }
}

// Live source-of-truth reads/writes must never be served from Next's
// persistent fetch cache, so every request opts out with `no-store`.
const NO_STORE = { cache: 'no-store' as const }

// ---- GHL response shapes (verified against the Opportunities API) ----

export interface GhlPipelineStage {
  id: string
  name: string
  position: number
}

export interface GhlPipeline {
  id: string
  name: string
  stages: GhlPipelineStage[]
}

export interface GhlEmbeddedContact {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  tags?: string[]
}

export interface GhlOpportunity {
  id: string
  name: string | null
  monetaryValue: number | null
  pipelineId: string
  pipelineStageId: string | null
  assignedTo: string | null
  status: string
  source: string | null
  createdAt: string | null
  updatedAt: string | null
  contactId: string | null
  contact?: GhlEmbeddedContact | null
}

export interface GhlSearchMeta {
  total: number
  startAfter?: number
  startAfterId?: string
  nextPageUrl?: string | null
}

export interface GhlContact {
  id: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
  tags?: string[]
  source?: string | null
}

// ---- Pipelines ----

export async function fetchGhlPipelines(
  apiKey: string,
  locationId: string
): Promise<GhlPipeline[]> {
  const res = await fetch(
    `${GHL_BASE}/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`,
    { headers: getHeaders(apiKey), ...NO_STORE }
  )
  if (!res.ok) throw new Error(`GHL pipelines fetch failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return (data.pipelines ?? []) as GhlPipeline[]
}

// ---- Opportunity search (cursor pagination) ----

export async function searchGhlOpportunities(
  apiKey: string,
  locationId: string,
  opts: { limit?: number; startAfter?: number; startAfterId?: string } = {}
): Promise<{ opportunities: GhlOpportunity[]; meta: GhlSearchMeta }> {
  const params = new URLSearchParams({
    location_id: locationId,
    limit: String(opts.limit ?? 100),
  })
  if (opts.startAfter != null) params.set('startAfter', String(opts.startAfter))
  if (opts.startAfterId) params.set('startAfterId', opts.startAfterId)

  const res = await fetch(`${GHL_BASE}/opportunities/search?${params}`, {
    headers: getHeaders(apiKey),
    ...NO_STORE,
  })
  if (!res.ok) throw new Error(`GHL opportunities search failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return {
    opportunities: (data.opportunities ?? []) as GhlOpportunity[],
    meta: (data.meta ?? { total: 0 }) as GhlSearchMeta,
  }
}

/**
 * Follows GHL's cursor pagination until exhausted or `max` is reached.
 * Optionally filters client-side by status (GHL search has no status filter).
 */
export async function fetchAllGhlOpportunities(
  apiKey: string,
  locationId: string,
  opts: { status?: string; max?: number } = {}
): Promise<GhlOpportunity[]> {
  const max = opts.max ?? 500
  const out: GhlOpportunity[] = []
  let startAfter: number | undefined
  let startAfterId: string | undefined

  while (out.length < max) {
    const remaining = max - out.length
    const limit = Math.min(100, remaining)
    const { opportunities, meta } = await searchGhlOpportunities(apiKey, locationId, {
      limit,
      startAfter,
      startAfterId,
    })
    if (opportunities.length === 0) break

    for (const opp of opportunities) {
      if (opts.status && opp.status !== opts.status) continue
      out.push(opp)
    }

    // No further cursor -> last page.
    if (meta.startAfter == null || !meta.startAfterId) break
    // Guard against a stuck cursor (same page returned again).
    if (meta.startAfter === startAfter && meta.startAfterId === startAfterId) break
    startAfter = meta.startAfter
    startAfterId = meta.startAfterId
  }

  return out.slice(0, max)
}

// ---- Single opportunity ----

export async function getGhlOpportunity(
  apiKey: string,
  id: string
): Promise<GhlOpportunity | null> {
  const res = await fetch(`${GHL_BASE}/opportunities/${id}`, {
    headers: getHeaders(apiKey),
    ...NO_STORE,
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GHL opportunity fetch failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return (data.opportunity ?? null) as GhlOpportunity | null
}

// ---- Write-through mutations ----

export async function updateGhlOpportunityStage(
  apiKey: string,
  id: string,
  pipelineId: string,
  pipelineStageId: string
): Promise<void> {
  const res = await fetch(`${GHL_BASE}/opportunities/${id}`, {
    method: 'PUT',
    headers: getHeaders(apiKey),
    body: JSON.stringify({ pipelineId, pipelineStageId }),
    ...NO_STORE,
  })
  if (!res.ok) throw new Error(`GHL opportunity stage update failed: ${res.status} ${await res.text()}`)
}

export async function updateGhlOpportunityStatus(
  apiKey: string,
  id: string,
  status: string
): Promise<void> {
  const res = await fetch(`${GHL_BASE}/opportunities/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(apiKey),
    body: JSON.stringify({ status }),
    ...NO_STORE,
  })
  if (!res.ok) throw new Error(`GHL opportunity status update failed: ${res.status} ${await res.text()}`)
}

export async function assignGhlOpportunity(
  apiKey: string,
  id: string,
  assignedTo: string
): Promise<void> {
  const res = await fetch(`${GHL_BASE}/opportunities/${id}`, {
    method: 'PUT',
    headers: getHeaders(apiKey),
    body: JSON.stringify({ assignedTo }),
    ...NO_STORE,
  })
  if (!res.ok) throw new Error(`GHL opportunity assign failed: ${res.status} ${await res.text()}`)
}

// ---- Contact ----

export async function getGhlContact(apiKey: string, id: string): Promise<GhlContact | null> {
  const res = await fetch(`${GHL_BASE}/contacts/${id}`, {
    headers: getHeaders(apiKey),
    ...NO_STORE,
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GHL contact fetch failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return (data.contact ?? null) as GhlContact | null
}
