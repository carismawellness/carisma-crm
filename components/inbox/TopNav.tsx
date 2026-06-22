'use client'

import { useEffect, useState } from 'react'
import { BRANDS } from '@/lib/constants'
import type { BrandId } from '@/lib/constants'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b bg-white shrink-0 z-10">
      <div className="flex items-center gap-6">
        <span className="font-semibold text-gray-900 text-base">🌿 Carisma CRM</span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onBrandChange(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedBrand === null
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {Object.values(BRANDS).map(brand => (
            <button
              key={brand.id}
              onClick={() => onBrandChange(brand.id as BrandId)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedBrand === brand.id
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={
                selectedBrand === brand.id
                  ? { backgroundColor: brand.color }
                  : undefined
              }
            >
              {brand.name.replace('Carisma ', '')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {streak > 0 && (
          <span className="text-sm font-medium text-orange-500">
            🔥 {streak} day streak
          </span>
        )}
        {agentName && (
          <span className="text-sm text-gray-600">{agentName}</span>
        )}
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  )
}
