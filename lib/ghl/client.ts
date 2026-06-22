const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_VERSION = '2021-07-28'

function getHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_VERSION,
    'Content-Type': 'application/json',
  }
}

export async function sendGhlMessage(
  apiKey: string,
  conversationId: string,
  message: string,
  type: 'WhatsApp' | 'IG' | 'FB' = 'WhatsApp'
) {
  const res = await fetch(`${GHL_BASE}/conversations/messages`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify({ conversationId, message, type }),
  })
  if (!res.ok) throw new Error(`GHL send failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function getGhlConversation(apiKey: string, conversationId: string) {
  const res = await fetch(`${GHL_BASE}/conversations/${conversationId}`, {
    headers: getHeaders(apiKey),
  })
  if (!res.ok) throw new Error(`GHL fetch failed: ${res.status}`)
  return res.json()
}

export interface GhlConversation {
  id: string
  locationId: string
  contactId: string
  contactName: string
  fullName: string
  phone: string | null
  email: string | null
  lastMessageDate: number
  lastMessageBody: string
  lastMessageType: string
  lastMessageDirection: string
  unreadCount: number
  inbox: boolean
  dateAdded: number
  dateUpdated: number
}

export interface GhlMessage {
  id: string
  conversationId: string
  body: string
  direction: 'inbound' | 'outbound'
  messageType: string
  dateAdded: string
  userId?: string
  contactId?: string
}

export async function fetchGhlConversations(
  apiKey: string,
  locationId: string,
  limit = 50,
  lastMessageAfter?: number
): Promise<GhlConversation[]> {
  const params = new URLSearchParams({
    locationId,
    limit: String(limit),
    status: 'all',
    sortBy: 'last_message_date',
    sort: 'desc',
  })
  if (lastMessageAfter) {
    params.set('lastMessageDate', String(lastMessageAfter))
  }
  const res = await fetch(`${GHL_BASE}/conversations/search?${params}`, {
    headers: getHeaders(apiKey),
  })
  if (!res.ok) throw new Error(`GHL conversations fetch failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return (data.conversations ?? []) as GhlConversation[]
}

export async function fetchGhlMessages(
  apiKey: string,
  conversationId: string,
  limit = 20
): Promise<GhlMessage[]> {
  const res = await fetch(
    `${GHL_BASE}/conversations/${conversationId}/messages?limit=${limit}`,
    { headers: getHeaders(apiKey) }
  )
  if (!res.ok) throw new Error(`GHL messages fetch failed: ${res.status}`)
  const data = await res.json()
  // The API wraps messages in data.messages.messages
  const msgs = data.messages?.messages ?? data.messages ?? []
  return msgs as GhlMessage[]
}
