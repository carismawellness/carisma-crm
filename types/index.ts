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
