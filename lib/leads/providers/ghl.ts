import type { BrandId } from '@/lib/constants'
import type { LeadStatus } from '@/types'
import {
  type LeadProvider,
  type ProviderContact,
  type ProviderLead,
  type ProviderStage,
  NotImplementedError,
} from '../provider'

// ============================================================
// GHL provider — the ONLY lead file permitted to import lib/ghl.
// Wave 0: contract skeleton (throws). Wave 1 fills these in using the
// GHL Opportunities/Pipelines/Contacts API and lib/leads/mapping.ts:
//   stages:   GET /opportunities/pipelines?locationId={id}   (camelCase locationId)
//   list:     GET /opportunities/search?location_id={id}
//   detail:   GET /opportunities/{id}
//   contact:  GET /contacts/{id}
//   stage:    PUT /opportunities/{id}  { pipelineStageId }
//   status:   PUT /opportunities/{id}/status  { status }
//   assign:   PUT /opportunities/{id}  { assignedTo }
// All GHL request/response shapes map to the DTOs above at THIS boundary.
// ============================================================
export class GhlLeadProvider implements LeadProvider {
  async listPipelineStages(_brandId: BrandId): Promise<ProviderStage[]> {
    throw new NotImplementedError('listPipelineStages')
  }
  async listLeads(_brandId: BrandId, _opts?: { status?: LeadStatus }): Promise<ProviderLead[]> {
    throw new NotImplementedError('listLeads')
  }
  async getLead(_brandId: BrandId, _externalId: string): Promise<ProviderLead | null> {
    throw new NotImplementedError('getLead')
  }
  async getContact(_brandId: BrandId, _contactExternalId: string): Promise<ProviderContact | null> {
    throw new NotImplementedError('getContact')
  }
  async advanceStage(_brandId: BrandId, _externalId: string, _stageExternalId: string): Promise<void> {
    throw new NotImplementedError('advanceStage')
  }
  async setStatus(_brandId: BrandId, _externalId: string, _status: LeadStatus): Promise<void> {
    throw new NotImplementedError('setStatus')
  }
  async assign(_brandId: BrandId, _externalId: string, _providerUserId: string): Promise<void> {
    throw new NotImplementedError('assign')
  }
}
