import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResponseTimer } from '../useResponseTimer'

describe('useResponseTimer', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns null when waitingSince is null', () => {
    const { result } = renderHook(() => useResponseTimer(null))
    expect(result.current).toBeNull()
  })

  it('returns elapsed ms when waitingSince is set', () => {
    const past = new Date(Date.now() - 5000).toISOString()
    const { result } = renderHook(() => useResponseTimer(past))
    expect(result.current).toBeGreaterThanOrEqual(5000)
  })

  it('updates every second', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    const { result } = renderHook(() => useResponseTimer(past))
    const first = result.current
    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current).toBeGreaterThan(first!)
  })

  it('returns null when waitingSince becomes null', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    const { result, rerender } = renderHook(
      ({ ws }) => useResponseTimer(ws),
      { initialProps: { ws: past } }
    )
    expect(result.current).not.toBeNull()
    rerender({ ws: null })
    expect(result.current).toBeNull()
  })
})
