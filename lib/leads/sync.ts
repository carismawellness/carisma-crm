import { createServiceClient } from '@/lib/supabase/server'
import { getLeadProvider } from '@/lib/leads/provider'
import { computeLeadScore, computeSlaDueAt } from '@/lib/leads/scoring'
import type { BrandId } from '@/lib/constants'
import type { LeadStatus } from '@/types'
import type { ProviderContact, ProviderLead } from '@/lib/leads/provider'

// ============================================================
// DTO -> mirror upsert layer. The ONLY writer of crm_contacts /
// crm_pipeline_stages / crm_leads from provider data. Reads go through
// getLeadProvider(brandId) so GHL never leaks into this file; the
// provider already returns provider-agnostic DTOs.
//
// Contact strategy: listLeads() returns ProviderLead[] only — the
// embedded contact is dropped at the provider boundary. syncBrandLeads
// therefore lazily hydrates each lead's contact via provider.getContact
// (memoised per run). upsertLeadFromProvider accepts an optional
// pre-fetched contactDto; when null it writes a minimal contact row keyed
// on contactExternalId, which webhooks / lead-detail later enrich.
// ============================================================

const PROVIDER = 'ghl'

/** Mirror a brand's pipeline stages into crm_pipeline_stages. */
export async function syncBrandStages(brandId: BrandId): Promise<number> {
  const provider = getLeadProvider(brandId)
  const service = createServiceClient()

  const stages = await provider.listPipelineStages(brandId)
  if (stages.length === 0) return 0

  const rows = stages.map((s) => ({
    provider: PROVIDER,
    external_id: s.externalId,
    brand_id: s.brandId,
    pipeline_external_id: s.pipelineExternalId,
    name: s.name,
    position: s.position,
    is_won: s.isWon,
    is_lost: s.isLost,
  }))

  const { error } = await service
    .from('crm_pipeline_stages')
    .upsert(rows, { onConflict: 'provider,external_id' })

  if (error) throw error
  return rows.length
}

/** Resolve (upsert) a contact mirror row, returning its uuid. */
async function resolveContactId(
  brandId: BrandId,
  contactExternalId: string | null,
  contactDto: ProviderContact | null
): Promise<string | null> {
  if (!contactExternalId) return null

  const service = createServiceClient()
  const row = {
    provider: PROVIDER,
    external_id: contactExternalId,
    brand_id: brandId,
    name: contactDto?.name ?? null,
    phone: contactDto?.phone ?? null,
    email: contactDto?.email ?? null,
    source: contactDto?.source ?? null,
    tags: contactDto?.tags ?? [],
  }

  const { data, error } = await service
    .from('crm_contacts')
    .upsert(row, { onConflict: 'provider,external_id' })
    .select('id')
    .single()

  if (error) throw error
  return data?.id ?? null
}

/** Resolve a stage mirror uuid from its provider external id. */
async function resolveStageId(stageExternalId: string | null): Promise<string | null> {
  if (!stageExternalId) return null

  const service = createServiceClient()
  const { data } = await service
    .from('crm_pipeline_stages')
    .select('id')
    .eq('provider', PROVIDER)
    .eq('external_id', stageExternalId)
    .maybeSingle()

  return data?.id ?? null
}

/**
 * Upsert a single lead (+ its contact) from provider DTOs into crm_leads.
 * Computes sla_due_at and lead_score. Returns the lead row uuid.
 */
export async function upsertLeadFromProvider(
  brandId: BrandId,
  dto: ProviderLead,
  contactDto: ProviderContact | null
): Promise<string> {
  const service = createServiceClient()

  const contactId = await resolveContactId(brandId, dto.contactExternalId, contactDto)
  const stageId = await resolveStageId(dto.stageExternalId)

  const slaDueAt = computeSlaDueAt(dto.externalCreatedAt)

  // Preserve agent-set fields (first_contacted_at, assigned_agent_id) across
  // syncs by reading the existing mirror row first.
  const { data: existing } = await service
    .from('crm_leads')
    .select('id, first_contacted_at, last_activity_at, assigned_agent_id')
    .eq('provider', PROVIDER)
    .eq('external_id', dto.externalId)
    .maybeSingle()

  const firstContactedAt = existing?.first_contacted_at ?? null
  const lastActivityAt = existing?.last_activity_at ?? null

  const leadScore = computeLeadScore({
    monetaryValue: dto.monetaryValue,
    slaDueAt,
    firstContactedAt,
    externalCreatedAt: dto.externalCreatedAt,
    status: dto.status,
  })

  const row = {
    provider: PROVIDER,
    external_id: dto.externalId,
    brand_id: brandId,
    contact_id: contactId,
    name: dto.name,
    monetary_value: dto.monetaryValue,
    status: dto.status,
    stage_id: stageId,
    source: dto.source,
    // Keep an existing local assignment; otherwise leave null (the provider
    // user id is not an agent uuid, so we don't map it here).
    assigned_agent_id: existing?.assigned_agent_id ?? null,
    lead_score: leadScore,
    sla_due_at: slaDueAt,
    external_created_at: dto.externalCreatedAt,
    first_contacted_at: firstContactedAt,
    last_activity_at: lastActivityAt,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await service
    .from('crm_leads')
    .upsert(row, { onConflict: 'provider,external_id' })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

interface SyncLeadsOpts {
  status?: LeadStatus
  /** Cap the number of leads processed (serverless time guard). */
  max?: number
}

/**
 * List a brand's leads from the provider and mirror each into crm_leads,
 * hydrating contacts via provider.getContact (memoised per run). Returns
 * the number of leads upserted.
 */
export async function syncBrandLeads(
  brandId: BrandId,
  opts?: SyncLeadsOpts
): Promise<number> {
  const provider = getLeadProvider(brandId)

  let leads = await provider.listLeads(brandId, { status: opts?.status })
  if (opts?.max != null && leads.length > opts.max) {
    leads = leads.slice(0, opts.max)
  }

  // Memoise contact hydration so repeated contactExternalIds fetch once.
  const contactCache = new Map<string, ProviderContact | null>()

  let count = 0
  for (const lead of leads) {
    let contactDto: ProviderContact | null = null
    const cid = lead.contactExternalId
    if (cid) {
      if (contactCache.has(cid)) {
        contactDto = contactCache.get(cid) ?? null
      } else {
        try {
          contactDto = await provider.getContact(brandId, cid)
        } catch {
          contactDto = null
        }
        contactCache.set(cid, contactDto)
      }
    }
    await upsertLeadFromProvider(brandId, lead, contactDto)
    count++
  }

  return count
}
