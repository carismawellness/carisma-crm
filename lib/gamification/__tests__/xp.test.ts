import { describe, it, expect } from 'vitest'
import { getSpeedRating, calculateReplyXp, getLevelFromXp } from '../xp'

describe('getSpeedRating', () => {
  it('returns lightning under 2 min', () => {
    expect(getSpeedRating(90_000)).toBe('lightning')
  })
  it('returns lightning at exactly 2 min', () => {
    expect(getSpeedRating(120_000)).toBe('lightning')
  })
  it('returns fast under 5 min', () => {
    expect(getSpeedRating(240_000)).toBe('fast')
  })
  it('returns fast at exactly 5 min', () => {
    expect(getSpeedRating(300_000)).toBe('fast')
  })
  it('returns slow over 5 min', () => {
    expect(getSpeedRating(400_000)).toBe('slow')
  })
})

describe('calculateReplyXp', () => {
  it('gives 20 XP for lightning reply', () => {
    expect(calculateReplyXp(60_000)).toBe(20)
  })
  it('gives 10 XP for fast reply', () => {
    expect(calculateReplyXp(200_000)).toBe(10)
  })
  it('gives 0 XP for slow reply', () => {
    expect(calculateReplyXp(400_000)).toBe(0)
  })
})

describe('getLevelFromXp', () => {
  it('rookie at 0', () => expect(getLevelFromXp(0)).toBe('Rookie'))
  it('pro at 500', () => expect(getLevelFromXp(500)).toBe('Pro'))
  it('ace at 2000', () => expect(getLevelFromXp(2000)).toBe('Ace'))
  it('legend at 10000', () => expect(getLevelFromXp(10000)).toBe('Legend'))
  it('still pro at 1999', () => expect(getLevelFromXp(1999)).toBe('Pro'))
  it('still rookie at 499', () => expect(getLevelFromXp(499)).toBe('Rookie'))
})
