import type { BrandId } from '@/lib/constants'
import type { LeadStatus } from '@/types'
import type {
  GhlContact,
  GhlEmbeddedContact,
  GhlOpportunity,
  GhlPipelineStage,
} from '@/lib/ghl/opportunities'
import type { ProviderContact, ProviderLead, ProviderStage } from './provider'

// ============================================================
// Pure GHL -> provider-DTO mapping. This file and providers/ghl.ts are
// the ONLY places permitted to know GHL shapes; everything downstream
// consumes the provider-agnostic DTOs.
// ============================================================

const WON_RE = /won/i
const LOST_RE = /(lost|no show)/i

/** GHL `status` strings map 1:1 onto our LeadStatus union. */
function toLeadStatus(status: string): LeadStatus {
  switch (status) {
    case 'won':
    case 'lost':
    case 'abandoned':
      return status
    default:
      return 'open'
  }
}

export function mapGhlOpportunityToProviderLead(
  opp: GhlOpportunity,
  brandId: BrandId
): ProviderLead {
  return {
    externalId: opp.id,
    brandId,
    name: opp.name ?? null,
    monetaryValue: opp.monetaryValue ?? 0,
    status: toLeadStatus(opp.status),
    stageExternalId: opp.pipelineStageId ?? null,
    source: opp.source ?? null,
    contactExternalId: opp.contactId ?? opp.contact?.id ?? null,
    assignedProviderUserId: opp.assignedTo ?? null,
    externalCreatedAt: opp.createdAt ?? null,
  }
}

export function mapGhlEmbeddedContactToProviderContact(
  opp: GhlOpportunity,
  brandId: BrandId
): ProviderContact | null {
  const c: GhlEmbeddedContact | null | undefined = opp.contact
  if (!c) return null
  return {
    externalId: c.id,
    brandId,
    name: c.name ?? null,
    phone: c.phone ?? null,
    email: c.email ?? null,
    // The embedded contact carries no `source`; the opportunity's does.
    source: opp.source ?? null,
    tags: c.tags ?? [],
  }
}

export function mapGhlContactToProviderContact(
  c: GhlContact,
  brandId: BrandId
): ProviderContact {
  const name = c.name ?? joinName(c.firstName, c.lastName)
  return {
    externalId: c.id,
    brandId,
    name,
    phone: c.phone ?? null,
    email: c.email ?? null,
    source: c.source ?? null,
    tags: c.tags ?? [],
  }
}

export function mapGhlStageToProviderStage(
  stage: GhlPipelineStage,
  pipelineId: string,
  brandId: BrandId
): ProviderStage {
  return {
    externalId: stage.id,
    brandId,
    pipelineExternalId: pipelineId,
    name: stage.name,
    position: stage.position,
    isWon: WON_RE.test(stage.name),
    isLost: LOST_RE.test(stage.name),
  }
}

function joinName(first?: string | null, last?: string | null): string | null {
  const joined = [first, last].filter(Boolean).join(' ').trim()
  return joined.length > 0 ? joined : null
}
