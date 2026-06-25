import type { BrandId, Channel } from '@/lib/constants'

export type ConversationStatus = 'open' | 'pending' | 'closed'
export type MessageDirection = 'inbound' | 'outbound'
export type AgentLevel = 'Rookie' | 'Pro' | 'Ace' | 'Legend'
export type SpeedRating = 'lightning' | 'fast' | 'slow'

export interface Brand {
  id: BrandId
  name: string
  ghl_location_id: string | null
  gmail_account: string | null
  color_hex: string
}

export interface Conversation {
  id: string
  brand_id: BrandId
  channel: Channel
  contact_name: string | null
  contact_identifier: string | null
  ghl_conversation_id: string | null
  gmail_thread_id: string | null
  contact_id: string | null
  status: ConversationStatus
  unread_count: number
  last_message_at: string | null
  waiting_since: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  direction: MessageDirection
  body: string
  sent_at: string
  sender_name: string | null
  agent_id: string | null
  response_time_ms: number | null
  channel_metadata: Record<string, unknown>
}

export interface Agent {
  id: string
  name: string
  email: string
  assigned_brands: BrandId[]
  xp: number
  level: AgentLevel
  current_streak: number
  longest_streak: number
  last_active_date: string | null
}

export interface XpEvent {
  id: string
  agent_id: string
  event_type: string
  xp_earned: number
  conversation_id: string | null
  created_at: string
}

export interface LeaderboardEntry {
  agent_id: string
  name: string
  conversations_closed: number
  avg_response_ms: number | null
  xp_today: number
}

export interface ConversationWithLastMessage extends Conversation {
  last_message_body: string | null
  last_message_direction: MessageDirection | null
}

// ============================================================
// Tasks module (lead pipeline). Mirror-row shapes (snake_case),
// consistent with Conversation/Message above. These are what the
// API + UI consume; provider-specific shapes stay behind LeadProvider.
// ============================================================

export type LeadStatus = 'open' | 'won' | 'lost' | 'abandoned'
export type LeadActivityType =
  | 'call'
  | 'note'
  | 'stage_change'
  | 'assignment'
  | 'status_change'
  | 'system'
export type LeadTemperature = 'hot' | 'warm' | 'cold'

export interface Contact {
  id: string
  provider: string
  external_id: string
  brand_id: BrandId
  name: string | null
  phone: string | null
  email: string | null
  source: string | null
  tags: string[]
  created_at: string
}

export interface PipelineStage {
  id: string
  provider: string
  external_id: string
  brand_id: BrandId
  pipeline_external_id: string
  name: string
  position: number
  is_won: boolean
  is_lost: boolean
}

export interface Lead {
  id: string
  provider: string
  external_id: string
  brand_id: BrandId
  contact_id: string | null
  name: string | null
  monetary_value: number
  status: LeadStatus
  stage_id: string | null
  source: string | null
  assigned_agent_id: string | null
  lead_score: number
  first_contacted_at: string | null
  sla_due_at: string | null
  external_created_at: string | null
  last_activity_at: string | null
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  agent_id: string | null
  type: LeadActivityType
  body: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface LeadWithContact extends Lead {
  contact: Contact | null
  stage: PipelineStage | null
}

export interface LeadDetail extends LeadWithContact {
  activities: LeadActivity[]
  // The same person's chat threads (unified Contact link).
  conversations: Conversation[]
}

export interface TasksLeaderboardEntry {
  agent_id: string
  name: string
  leads_booked: number
  leads_won: number
  avg_speed_to_lead_ms: number | null
  xp_today: number
}
