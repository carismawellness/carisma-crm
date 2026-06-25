import { BRANDS, type BrandId } from '@/lib/constants'
import type { LeadStatus } from '@/types'
import {
  assignGhlOpportunity,
  fetchAllGhlOpportunities,
  fetchGhlPipelines,
  getGhlContact,
  getGhlOpportunity,
  updateGhlOpportunityStage,
  updateGhlOpportunityStatus,
} from '@/lib/ghl/opportunities'
import {
  mapGhlContactToProviderContact,
  mapGhlEmbeddedContactToProviderContact,
  mapGhlOpportunityToProviderLead,
  mapGhlStageToProviderStage,
} from '../mapping'
import type {
  LeadProvider,
  ProviderContact,
  ProviderLead,
  ProviderLeadWithContact,
  ProviderStage,
} from '../provider'

// ============================================================
// GHL provider — the ONLY lead file permitted to import lib/ghl.
// Maps GHL Opportunities/Pipelines/Contacts onto the provider DTOs via
// lib/leads/mapping.ts. Brand credentials come from BRANDS[brandId].
//   stages:   GET /opportunities/pipelines?locationId={id}  (flattened)
//   list:     GET /opportunities/search?location_id={id}
//   detail:   GET /opportunities/{id}
//   contact:  GET /contacts/{id}
//   stage:    PUT /opportunities/{id}  { pipelineId, pipelineStageId }
//   status:   PUT /opportunities/{id}/status  { status }
//   assign:   PUT /opportunities/{id}  { assignedTo }
// ============================================================

function creds(brandId: BrandId): { apiKey: string; locationId: string } {
  const brand = BRANDS[brandId]
  return { apiKey: brand.ghlApiKey, locationId: brand.ghlLocationId }
}

export class GhlLeadProvider implements LeadProvider {
  async listPipelineStages(brandId: BrandId): Promise<ProviderStage[]> {
    const { apiKey, locationId } = creds(brandId)
    const pipelines = await fetchGhlPipelines(apiKey, locationId)
    // A location has multiple pipelines; flatten every pipeline's stages.
    return pipelines.flatMap((pipeline) =>
      pipeline.stages.map((stage) =>
        mapGhlStageToProviderStage(stage, pipeline.id, brandId)
      )
    )
  }

  async listLeads(brandId: BrandId, opts?: { status?: LeadStatus }): Promise<ProviderLead[]> {
    const { apiKey, locationId } = creds(brandId)
    const opportunities = await fetchAllGhlOpportunities(apiKey, locationId, {
      status: opts?.status,
    })
    return opportunities.map((opp) => mapGhlOpportunityToProviderLead(opp, brandId))
  }

  async listLeadsWithContacts(
    brandId: BrandId,
    opts?: { status?: LeadStatus }
  ): Promise<ProviderLeadWithContact[]> {
    const { apiKey, locationId } = creds(brandId)
    // The opportunity search embeds the contact, so one pass yields both —
    // no per-contact round trips.
    const opportunities = await fetchAllGhlOpportunities(apiKey, locationId, {
      status: opts?.status,
    })
    return opportunities.map((opp) => ({
      lead: mapGhlOpportunityToProviderLead(opp, brandId),
      contact: mapGhlEmbeddedContactToProviderContact(opp, brandId),
    }))
  }

  async getLead(brandId: BrandId, externalId: string): Promise<ProviderLead | null> {
    const { apiKey } = creds(brandId)
    const opp = await getGhlOpportunity(apiKey, externalId)
    return opp ? mapGhlOpportunityToProviderLead(opp, brandId) : null
  }

  async getContact(brandId: BrandId, contactExternalId: string): Promise<ProviderContact | null> {
    const { apiKey } = creds(brandId)
    const contact = await getGhlContact(apiKey, contactExternalId)
    return contact ? mapGhlContactToProviderContact(contact, brandId) : null
  }

  async advanceStage(brandId: BrandId, externalId: string, stageExternalId: string): Promise<void> {
    const { apiKey } = creds(brandId)
    // GHL's stage update requires the owning pipelineId; fetch the opp first.
    const opp = await getGhlOpportunity(apiKey, externalId)
    if (!opp) throw new Error(`GHL opportunity ${externalId} not found`)
    await updateGhlOpportunityStage(apiKey, externalId, opp.pipelineId, stageExternalId)
  }

  async setStatus(brandId: BrandId, externalId: string, status: LeadStatus): Promise<void> {
    const { apiKey } = creds(brandId)
    await updateGhlOpportunityStatus(apiKey, externalId, status)
  }

  async assign(brandId: BrandId, externalId: string, providerUserId: string): Promise<void> {
    const { apiKey } = creds(brandId)
    await assignGhlOpportunity(apiKey, externalId, providerUserId)
  }
}
