import { describe, it, expect } from 'vitest'
import { LEAD_COLD_MS, LEAD_SLA_MS } from '@/lib/constants'
import { computeLeadScore, computeSlaDueAt, resolveTemperature } from '../scoring'

const NOW = Date.parse('2026-06-25T12:00:00.000Z')

describe('computeSlaDueAt', () => {
  it('returns created + LEAD_SLA_MS as ISO', () => {
    const created = '2026-06-25T12:00:00.000Z'
    expect(computeSlaDueAt(created)).toBe(new Date(Date.parse(created) + LEAD_SLA_MS).toISOString())
  })
  it('returns null for null input', () => {
    expect(computeSlaDueAt(null)).toBeNull()
  })
  it('returns null for an unparseable date', () => {
    expect(computeSlaDueAt('not-a-date')).toBeNull()
  })
})

describe('resolveTemperature', () => {
  it('HOT: open, past SLA, never first-contacted', () => {
    const t = resolveTemperature({
      status: 'open',
      slaDueAt: new Date(NOW - 60_000).toISOString(),
      firstContactedAt: null,
      lastActivityAt: null,
      now: NOW,
    })
    expect(t).toBe('hot')
  })

  it('COLD: open, no activity for >= LEAD_COLD_MS', () => {
    const t = resolveTemperature({
      status: 'open',
      slaDueAt: new Date(NOW + 60_000).toISOString(), // not yet past SLA
      firstContactedAt: new Date(NOW - LEAD_COLD_MS - 60_000).toISOString(),
      lastActivityAt: new Date(NOW - LEAD_COLD_MS - 60_000).toISOString(),
      now: NOW,
    })
    expect(t).toBe('cold')
  })

  it('WARM: open, worked recently, within SLA', () => {
    const t = resolveTemperature({
      status: 'open',
      slaDueAt: new Date(NOW + 60_000).toISOString(),
      firstContactedAt: new Date(NOW - 60_000).toISOString(),
      lastActivityAt: new Date(NOW - 60_000).toISOString(),
      now: NOW,
    })
    expect(t).toBe('warm')
  })

  it('WARM: closed leads are never hot/cold', () => {
    expect(
      resolveTemperature({
        status: 'won',
        slaDueAt: new Date(NOW - 60_000).toISOString(),
        firstContactedAt: null,
        lastActivityAt: new Date(NOW - LEAD_COLD_MS - 60_000).toISOString(),
        now: NOW,
      })
    ).toBe('warm')
  })

  it('past SLA but already first-contacted is not hot', () => {
    const t = resolveTemperature({
      status: 'open',
      slaDueAt: new Date(NOW - 60_000).toISOString(),
      firstContactedAt: new Date(NOW - 30_000).toISOString(),
      lastActivityAt: new Date(NOW - 30_000).toISOString(),
      now: NOW,
    })
    expect(t).toBe('warm')
  })
})

describe('computeLeadScore', () => {
  it('scores closed leads at ~0', () => {
    expect(
      computeLeadScore({
        monetaryValue: 5000,
        slaDueAt: new Date(NOW - 60_000).toISOString(),
        firstContactedAt: null,
        externalCreatedAt: new Date(NOW).toISOString(),
        status: 'won',
        now: NOW,
      })
    ).toBe(0)
  })

  it('hot unworked (past SLA) outscores a cold worked lead of equal value', () => {
    const value = 1000
    const created = new Date(NOW - 60_000).toISOString()

    const hotUnworked = computeLeadScore({
      monetaryValue: value,
      slaDueAt: new Date(NOW - 60_000).toISOString(), // past SLA
      firstContactedAt: null, // unworked
      externalCreatedAt: created,
      status: 'open',
      now: NOW,
    })

    const coldWorked = computeLeadScore({
      monetaryValue: value,
      slaDueAt: new Date(NOW + 60_000).toISOString(),
      firstContactedAt: new Date(NOW - LEAD_COLD_MS).toISOString(), // worked
      externalCreatedAt: created,
      status: 'open',
      now: NOW,
    })

    expect(hotUnworked).toBeGreaterThan(coldWorked)
  })

  it('higher monetary value scores higher, all else equal', () => {
    const base = {
      slaDueAt: new Date(NOW + 60_000).toISOString(),
      firstContactedAt: null,
      externalCreatedAt: new Date(NOW).toISOString(),
      status: 'open' as const,
      now: NOW,
    }
    expect(computeLeadScore({ ...base, monetaryValue: 2000 })).toBeGreaterThan(
      computeLeadScore({ ...base, monetaryValue: 200 })
    )
  })

  it('newer leads score higher than older ones, all else equal', () => {
    const base = {
      monetaryValue: 1000,
      slaDueAt: new Date(NOW + 60_000).toISOString(),
      firstContactedAt: null,
      status: 'open' as const,
      now: NOW,
    }
    const newer = computeLeadScore({ ...base, externalCreatedAt: new Date(NOW - 60_000).toISOString() })
    const older = computeLeadScore({
      ...base,
      externalCreatedAt: new Date(NOW - 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    expect(newer).toBeGreaterThan(older)
  })
})
