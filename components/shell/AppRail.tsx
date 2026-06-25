'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { Leaf, MessageCircle, KanbanSquare, Users, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

// GHL-style left icon-rail, Carisma-skinned. Collapsed by default; expands on
// hover to reveal Novecento labels. Active item = light-sage pill + accent bar.
const ITEMS = [
  { href: '/', label: 'Conversations', icon: MessageCircle, match: (p: string) => p === '/' },
  { href: '/opportunities', label: 'Opportunities', icon: KanbanSquare, match: (p: string) => p.startsWith('/opportunities') },
  { href: '/contacts', label: 'Contacts', icon: Users, match: (p: string) => p.startsWith('/contacts') },
]

export function AppRail() {
  const pathname = usePathname() ?? '/'
  const params = useSearchParams()
  const brandQuery = params.get('brand') ? `?brand=${params.get('brand')}` : ''
  const [agentName, setAgentName] = useState('')

  useEffect(() => {
    fetch('/api/agents/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.agent) setAgentName(d.agent.name) })
      .catch(() => {})
  }, [])

  const initials = agentName
    ? agentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <nav
      className="group/rail shrink-0 flex flex-col items-stretch py-3 z-30 transition-[width] duration-200 ease-out w-[64px] hover:w-[212px]"
      style={{ background: 'linear-gradient(180deg, #024C27 0%, #0a3a22 100%)' }}
    >
      {/* Logo */}
      <Link href={`/${brandQuery}`} className="flex items-center gap-2.5 h-10 px-[18px] mb-4 overflow-hidden">
        <div className="w-7 h-7 shrink-0 rounded-xl flex items-center justify-center bg-white/12">
          <Leaf className="w-3.5 h-3.5 text-white" />
        </div>
        <span
          className="text-[12px] tracking-[1.5px] uppercase text-white/90 whitespace-nowrap opacity-0 group-hover/rail:opacity-100 transition-opacity"
          style={{ fontFamily: "'Trajan Pro', Georgia, serif", fontWeight: 700 }}
        >
          Carisma
        </span>
      </Link>

      {/* Items */}
      <div className="flex flex-col gap-1 px-2">
        {ITEMS.map(item => {
          const active = item.match(pathname)
          const Icon = item.icon
          return (
            <Link key={item.href} href={`${item.href}${brandQuery}`} prefetch className="relative">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 h-10 px-[14px] rounded-xl overflow-hidden transition-colors"
                style={{
                  background: active ? 'rgba(201,216,193,0.18)' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.62)',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#C9D8C1]" />}
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span
                  className="text-[11px] whitespace-nowrap opacity-0 group-hover/rail:opacity-100 transition-opacity"
                  style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.5px', textTransform: 'uppercase' }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* Agent + sign out */}
      <div className="mt-auto px-2">
        <div className="flex items-center gap-3 h-12 px-[10px] rounded-xl overflow-hidden">
          <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white text-[10px] font-bold bg-white/15">
            {initials}
          </div>
          <span
            className="text-[10px] text-white/80 whitespace-nowrap truncate opacity-0 group-hover/rail:opacity-100 transition-opacity"
            style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '0.5px', textTransform: 'uppercase' }}
          >
            {agentName || '—'}
          </span>
          <form action={logout} className="ml-auto opacity-0 group-hover/rail:opacity-100 transition-opacity">
            <button type="submit" className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors" aria-label="Sign out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
