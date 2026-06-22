export const BRANDS = {
  spa: {
    id: 'spa',
    name: 'Carisma Spa',
    color: '#96B2B2',
    colorLight: '#DEEBEB',
    ghlLocationId: process.env.GHL_SPA_LOCATION_ID ?? '',
    ghlApiKey: process.env.GHL_SPA_API_KEY ?? '',
    gmailAccount: process.env.GMAIL_SPA_CLIENT_ID ? 'spa@carismaspa.com' : null,
  },
  slimming: {
    id: 'slimming',
    name: 'Carisma Slimming',
    color: '#024C27',
    colorLight: '#C9D8C1',
    ghlLocationId: process.env.GHL_SLIMMING_LOCATION_ID ?? '',
    ghlApiKey: process.env.GHL_SLIMMING_API_KEY ?? '',
    gmailAccount: null,
  },
  aesthetics: {
    id: 'aesthetics',
    name: 'Carisma Aesthetics',
    color: '#9B8D83',
    colorLight: '#EFE7D7',
    ghlLocationId: process.env.GHL_AESTHETICS_LOCATION_ID ?? '',
    ghlApiKey: process.env.GHL_AESTHETICS_API_KEY ?? '',
    gmailAccount: null,
  },
} as const

export type BrandId = keyof typeof BRANDS

export const CHANNELS = ['whatsapp', 'instagram', 'facebook', 'gmail'] as const
export type Channel = typeof CHANNELS[number]

export const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  gmail: 'Gmail',
}

export const CHANNEL_ICONS: Record<Channel, string> = {
  whatsapp: '💬',
  instagram: '📸',
  facebook: '👍',
  gmail: '📧',
}

export const XP = {
  CONVERSATION_CLOSED: 30,
  FAST_REPLY_LIGHTNING: 20,
  FAST_REPLY_FAST: 10,
  DAILY_GOAL: 100,
  STREAK_3_DAY: 50,
  STREAK_7_DAY: 200,
} as const

export const LEVELS = [
  { name: 'Rookie',  minXp: 0 },
  { name: 'Pro',     minXp: 500 },
  { name: 'Ace',     minXp: 2000 },
  { name: 'Legend',  minXp: 10000 },
] as const

export const DAILY_GOAL_TARGET = 20
export const HOT_THRESHOLD_MS = 10 * 60 * 1000
export const LIGHTNING_THRESHOLD_MS = 2 * 60 * 1000
export const FAST_THRESHOLD_MS = 5 * 60 * 1000
