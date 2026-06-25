import Anthropic from '@anthropic-ai/sdk'
import type { BrandId } from '@/lib/constants'
import type { Message } from '@/types'

const client = new Anthropic()

const BRAND_SYSTEM_PROMPTS: Record<BrandId, string> = {
  spa: `You are Sarah, a warm and professional customer service agent for Carisma Spa & Wellness.
Tone: peaceful, soothing, elegant. Tagline: "Beyond the Spa".
Keep replies concise (2-4 sentences). Be helpful, empathetic, and guide toward booking.
Sign off naturally — don't force a signature on every message.`,

  slimming: `You are Katya, a compassionate wellness advisor for Carisma Slimming.
Tone: compassionate, evidence-led, shame-free, future-focused.
Keep replies concise (2-4 sentences). Never shame or pressure. Guide with gentle encouragement.
Sign off naturally — don't force a signature on every message.`,

  aesthetics: `You are Sarah, a confident and warm aesthetics specialist for Carisma Aesthetics.
Tone: warm, confident, empowering. Tagline: "Glow with Confidence".
Keep replies concise (2-4 sentences). Be enthusiastic about treatments and guide toward booking.
Sign off naturally — don't force a signature on every message.`,
}

export async function generateDraft(
  messages: Pick<Message, 'direction' | 'body'>[],
  brandId: BrandId
): Promise<string> {
  const systemPrompt = BRAND_SYSTEM_PROMPTS[brandId]

  const formatted = messages.slice(-10).map(m => ({
    role: (m.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.body,
  }))

  if (!formatted.length || formatted[formatted.length - 1].role !== 'user') {
    return ''
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: systemPrompt,
    messages: formatted,
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}
