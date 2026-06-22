'use client'

import { useEffect, useState } from 'react'
import { BRANDS } from '@/lib/constants'
import type { BrandId } from '@/lib/constants'
import { logout } from '@/app/(auth)/login/actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import { StreakBadge } from '@/components/gamification/StreakBadge'
import { Leaf, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Props {
  selectedBrand: BrandId | null
  onBrandChange: (brand: BrandId | null) => void
}

export function TopNav({ selectedBrand, onBrandChange }: Props) {
  const [agentName, setAgentName] = useState<string>('')
  const [streak, setStreak] = useState<number>(0)

  useEffect(() => {
    fetch('/api/agents/me')
      .then(r => r.json())
      .then(d => {
        if (d.agent) {
          setAgentName(d.agent.name)
          setStreak(d.agent.current_streak ?? 0)
        }
      })
      .catch(() => {})
  }, [])

  const initials = agentName
    ? agentName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <header
      className="h-14 shrink-0 flex items-center justify-between px-5 z-20 glass border-b relative"
      style={{ borderColor: 'rgba(40,55,44,0.12)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4f7256 0%, #024C27 100%)' }}
          >
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          <span
            className="text-[13px] tracking-[2px] uppercase"
            style={{ fontFamily: "'Trajan Pro', Georgia, serif", color: '#024C27', fontWeight: 700 }}
          >
            Carisma CRM
          </span>
        </div>

        {/* Brand filter pills */}
        <nav
          className="flex items-center gap-1 p-1 rounded-full"
          style={{ background: 'rgba(40,55,44,0.06)' }}
        >
          <BrandPill
            label="All"
            active={selectedBrand === null}
            color={null}
            onClick={() => onBrandChange(null)}
          />
          {Object.values(BRANDS).map(brand => (
            <BrandPill
              key={brand.id}
              label={brand.name.replace('Carisma ', '')}
              active={selectedBrand === brand.id}
              color={brand.color}
              onClick={() => onBrandChange(brand.id as BrandId)}
            />
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {streak > 0 && <StreakBadge streak={streak} />}
        <ThemeToggle />

        {agentName && (
          <div
            className="flex items-center gap-2.5 pl-3 ml-1 border-l"
            style={{ borderColor: 'rgba(40,55,44,0.15)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4f7256 0%, #024C27 100%)' }}
            >
              {initials}
            </div>
            <span
              className="text-[12px] hidden sm:block"
              style={{ fontFamily: "'Novecento Wide', sans-serif", letterSpacing: '1px', textTransform: 'uppercase', color: '#5a4f43' }}
            >
              {agentName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{ color: '#8eb093' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#024C27')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8eb093')}
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}

function BrandPill({
  label,
  active,
  color,
  onClick,
}: {
  label: string
  active: boolean
  color: string | null
  onClick: () => void
}) {
  const activeColor = color ?? '#024C27'
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200"
      style={
        active
          ? {
              backgroundColor: activeColor,
              color: '#ffffff',
              boxShadow: `0 2px 10px ${activeColor}50`,
              fontFamily: "'Novecento Wide', sans-serif",
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }
          : {
              color: '#4f7256',
              fontFamily: "'Novecento Wide', sans-serif",
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }
      }
    >
      {label}
    </motion.button>
  )
}
