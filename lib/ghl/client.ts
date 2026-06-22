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
