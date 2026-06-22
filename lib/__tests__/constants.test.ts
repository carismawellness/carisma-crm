import { describe, it, expect } from 'vitest'
import { LEVELS, XP, BRANDS, CHANNELS } from '../constants'

describe('constants', () => {
  it('LEVELS are in ascending XP order', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXp).toBeGreaterThan(LEVELS[i - 1].minXp)
    }
  })

  it('XP values are all positive', () => {
    for (const val of Object.values(XP)) {
      expect(val).toBeGreaterThan(0)
    }
  })

  it('all three brands exist', () => {
    expect(BRANDS.spa.id).toBe('spa')
    expect(BRANDS.slimming.id).toBe('slimming')
    expect(BRANDS.aesthetics.id).toBe('aesthetics')
  })

  it('all channels defined', () => {
    expect(CHANNELS).toContain('whatsapp')
    expect(CHANNELS).toContain('instagram')
    expect(CHANNELS).toContain('facebook')
    expect(CHANNELS).toContain('gmail')
  })
})
