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
    <header className="h-14 shrink-0 flex items-center justify-between px-5 z-20 glass border-b border-white/40 dark:border-white/[0.08] relative">
      {/* Logo + brand filter */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#96B2B2] to-[#6391AB] shadow-sm">
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">
            Carisma CRM
          </span>
        </div>

        {/* Brand filter pills */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.05] dark:bg-white/[0.05]">
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

      {/* Right side: streak, theme toggle, agent avatar */}
      <div className="flex items-center gap-2">
        {streak > 0 && <StreakBadge streak={streak} />}
        <ThemeToggle />

        {agentName && (
          <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#96B2B2] to-[#6391AB] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              {initials}
            </div>
            <span className="text-[13px] font-medium text-foreground/70 hidden sm:block">
              {agentName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="w-7 h-7 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-all"
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
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'px-3 py-1 rounded-lg text-[12px] font-medium transition-all duration-150',
        active
          ? 'text-white shadow-sm'
          : 'text-foreground/60 hover:text-foreground hover:bg-white/50 dark:hover:bg-white/[0.08]'
      )}
      style={active ? { backgroundColor: color ?? 'oklch(0.18 0.008 260)' } : undefined}
    >
      {label}
    </motion.button>
  )
}
