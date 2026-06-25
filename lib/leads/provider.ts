import type { BrandId } from '@/lib/constants'
import type { LeadStatus } from '@/types'

// ============================================================
// The provider boundary — the modularity core of the Tasks module.
//
// Domain DTOs below are PROVIDER-AGNOSTIC: they carry external ids and
// plain values only, never a GHL-specific field. Mapping GHL <-> DTO
// lives exclusively in lib/leads/providers/ghl.ts + lib/leads/mapping.ts.
// The sync layer maps these DTOs into the snake_case mirror rows
// (crm_leads / crm_contacts / crm_pipeline_stages) that the API + UI read.
//
// To repoint at Carisma Soft later: implement CarismaSoftLeadProvider
// against its Postgres schema and set LEAD_PROVIDER=carismasoft. Nothing
// in app/, components/, or hooks/ changes.
// ============================================================

export interface ProviderContact {
  externalId: string
  brandId: BrandId
  name: string | null
  phone: string | null
  email: string | null
  source: string | null
  tags: string[]
}

export interface ProviderStage {
  externalId: string
  brandId: BrandId
  pipelineExternalId: string
  name: string
  position: number
  isWon: boolean
  isLost: boolean
}

export interface ProviderLead {
  externalId: string
  brandId: BrandId
  name: string | null
  monetaryValue: number
  status: LeadStatus
  stageExternalId: string | null
  source: string | null
  contactExternalId: string | null
  assignedProviderUserId: string | null
  externalCreatedAt: string | null
}

export interface ProviderLeadWithContact {
  lead: ProviderLead
  contact: ProviderContact | null
}

export interface LeadProvider {
  /** List the pipeline stages for a brand (mirrored on sync). */
  listPipelineStages(brandId: BrandId): Promise<ProviderStage[]>
  /** List leads/opportunities for a brand (mirrored on sync / backfill). */
  listLeads(brandId: BrandId, opts?: { status?: LeadStatus }): Promise<ProviderLead[]>
  /**
   * List leads WITH their contact in a single pass — no per-contact round
   * trips. Providers whose list payload embeds the contact (GHL does)
   * implement this efficiently; sync prefers it over listLeads + getContact.
   */
  listLeadsWithContacts(
    brandId: BrandId,
    opts?: { status?: LeadStatus }
  ): Promise<ProviderLeadWithContact[]>
  /** Hydrate a single lead live from the source of truth. */
  getLead(brandId: BrandId, externalId: string): Promise<ProviderLead | null>
  /** Fetch a contact by external id (lazy hydrate on lead open). */
  getContact(brandId: BrandId, contactExternalId: string): Promise<ProviderContact | null>
  /** Write-through: move a lead to a stage. */
  advanceStage(brandId: BrandId, externalId: string, stageExternalId: string): Promise<void>
  /** Write-through: set won/lost/abandoned/open. */
  setStatus(brandId: BrandId, externalId: string, status: LeadStatus): Promise<void>
  /** Write-through: assign an owner (provider user id). */
  assign(brandId: BrandId, externalId: string, providerUserId: string): Promise<void>
}

export class NotImplementedError extends Error {
  constructor(method: string) {
    super(`LeadProvider.${method} is not implemented for this provider yet`)
    this.name = 'NotImplementedError'
  }
}

// ---- Factory ------------------------------------------------
// Lazy requires keep provider modules out of the client bundle and avoid
// a static import cycle. The default today is GHL.
export function getLeadProvider(_brandId: BrandId): LeadProvider {
  if (process.env.LEAD_PROVIDER === 'carismasoft') {
    const { CarismaSoftLeadProvider } = require('./providers/carismasoft')
    return new CarismaSoftLeadProvider()
  }
  const { GhlLeadProvider } = require('./providers/ghl')
  return new GhlLeadProvider()
}
