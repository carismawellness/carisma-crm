import { describe, it, expect } from 'vitest'
import { resolveChannelFromGhl } from '../normalizer'

describe('resolveChannelFromGhl', () => {
  it('returns whatsapp for undefined', () => {
    expect(resolveChannelFromGhl(undefined)).toBe('whatsapp')
  })
  it('returns instagram for Instagram type', () => {
    expect(resolveChannelFromGhl('Instagram')).toBe('instagram')
  })
  it('returns instagram for IG type', () => {
    expect(resolveChannelFromGhl('IG')).toBe('instagram')
  })
  it('returns facebook for Facebook type', () => {
    expect(resolveChannelFromGhl('Facebook')).toBe('facebook')
  })
  it('returns facebook for FB type', () => {
    expect(resolveChannelFromGhl('FB')).toBe('facebook')
  })
  it('defaults to whatsapp for unknown types', () => {
    expect(resolveChannelFromGhl('SMS')).toBe('whatsapp')
  })
})
