import { MessageCircle, Camera, Users, Mail } from 'lucide-react'
import type { Channel } from '@/lib/constants'

export const CHANNEL_SVG_ICONS: Record<Channel, React.ReactNode> = {
  whatsapp: <MessageCircle className="w-3.5 h-3.5" style={{ color: '#25D366' }} />,
  instagram: <Camera className="w-3.5 h-3.5" style={{ color: '#E1306C' }} />,
  facebook: <Users className="w-3.5 h-3.5" style={{ color: '#1877F2' }} />,
  gmail: <Mail className="w-3.5 h-3.5" style={{ color: '#EA4335' }} />,
}

export const CHANNEL_ICON_COLORS: Record<Channel, string> = {
  whatsapp: '#25D366',
  instagram: '#E1306C',
  facebook: '#1877F2',
  gmail: '#EA4335',
}

export const CHANNEL_BG_COLORS: Record<Channel, string> = {
  whatsapp: 'rgba(37, 211, 102, 0.12)',
  instagram: 'rgba(225, 48, 108, 0.12)',
  facebook: 'rgba(24, 119, 242, 0.12)',
  gmail: 'rgba(234, 67, 53, 0.12)',
}
