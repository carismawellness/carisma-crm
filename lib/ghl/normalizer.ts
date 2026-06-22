import type { Channel, BrandId } from '@/lib/constants'

export interface GhlWebhookPayload {
  type: string
  locationId: string
  conversationId: string
  contactName?: string
  contactId?: string
  phone?: string
  email?: string
  messageType?: string
  body?: string
  direction?: string
  dateAdded?: string
  userId?: string
  [key: string]: unknown
}

export function resolveChannelFromGhl(messageType: string | undefined): Channel {
  if (!messageType) return 'whatsapp'
  const t = messageType.toLowerCase()
  if (t.includes('instagram') || t === 'ig') return 'instagram'
  if (t.includes('facebook') || t === 'fb') return 'facebook'
  return 'whatsapp'
}

export function resolveBrandFromLocationId(locationId: string): BrandId | null {
  const map: Record<string, BrandId> = {}
  if (process.env.GHL_SPA_LOCATION_ID) map[process.env.GHL_SPA_LOCATION_ID] = 'spa'
  if (process.env.GHL_SLIMMING_LOCATION_ID) map[process.env.GHL_SLIMMING_LOCATION_ID] = 'slimming'
  if (process.env.GHL_AESTHETICS_LOCATION_ID) map[process.env.GHL_AESTHETICS_LOCATION_ID] = 'aesthetics'
  return map[locationId] ?? null
}
