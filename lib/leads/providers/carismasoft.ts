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
// Carisma Soft (Postgres) provider — STUB.
//
// When the Carisma Soft lead/booking schema is ready:
//   1. Implement each method against its Postgres change feed / API.
//   2. Set LEAD_PROVIDER=carismasoft.
//   3. Point the mirror sync at Carisma Soft's change feed instead of
//      GHL Opportunity webhooks.
// The entire UI/API/hook layer is unchanged — that one-file swap is the
// whole reason the boundary exists. Keep it pristine.
// ============================================================
export class CarismaSoftLeadProvider implements LeadProvider {
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
