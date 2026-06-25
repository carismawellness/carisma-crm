'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BRANDS, type BrandId } from '@/lib/constants'
import { ThemeToggle } from '@/components/ThemeToggle'
import { motion } from 'framer-motion'

const MODULE_TITLES: Record<string, string> = {
  '/': 'Conversations',
  '/opportunities': 'Opportunities',
  '/contacts': 'Contacts',
}

// Shell top bar: module title + brand filter (synced to ?brand=) + theme.
// Brand lives in the URL so it persists across module navigation and is
// deep-linkable.
export function TopBar() {
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const params = useSearchParams()
  const brand = (params.get('brand') as BrandId | null) ?? null

  const title =
    MODULE_TITLES[pathname] ??
    Object.entries(MODULE_TITLES).find(([k]) => k !== '/' && pathname.startsWith(k))?.[1] ??
    'Conversations'

  function setBrand(next: BrandId | null) {
    const sp = new URLSearchParams(Array.from(params.entries()))
    if (next) sp.set('brand', next)
    else sp.delete('brand')
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
  }

  return (
    <header
      className="h-14 shrink-0 flex items-center justify-between px-5 z-20 glass border-b"
      style={{ borderColor: 'rgba(40,55,44,0.12)' }}
    >
      <div className="flex items-center gap-5">
        <span
          className="text-[13px] tracking-[2px] uppercase"
          style={{ fontFamily: "'Trajan Pro', Georgia, serif", color: '#024C27', fontWeight: 700 }}
        >
          {title}
        </span>
        <nav className="flex items-center gap-1 p-1 rounded-full" style={{ background: 'rgba(40,55,44,0.06)' }}>
          <BrandPill label="All" active={brand === null} color={null} onClick={() => setBrand(null)} />
          {Object.values(BRANDS).map(b => (
            <BrandPill
              key={b.id}
              label={b.name.replace('Carisma ', '')}
              active={brand === b.id}
              color={b.color}
              onClick={() => setBrand(b.id as BrandId)}
            />
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
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
