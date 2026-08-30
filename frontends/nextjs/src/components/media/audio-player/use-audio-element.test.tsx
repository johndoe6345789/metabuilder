import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, renderHook } from '@testing-library/react'

import { useAudioElement } from './use-audio-element'

function withElement() {
  const hook = renderHook(() => useAudioElement())
  render(<audio ref={hook.result.current.audioRef} />)
  return hook
}

describe('useAudioElement', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })

  it('starts paused with default volume', () => {
    const { result } = withElement()
    expect(result.current.playing).toBe(false)
    expect(result.current.vol).toBe(1)
  })

  it('plays a paused element on toggle', () => {
    const { result } = withElement()
    act(() => result.current.toggle())
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('pauses a playing element on toggle', () => {
    const { result } = withElement()
    Object.defineProperty(result.current.audioRef.current, 'paused', {
      value: false,
      configurable: true,
    })
    act(() => result.current.toggle())
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  })

  it('seeks the element to the given time', () => {
    const { result } = withElement()
    act(() =>
      result.current.seek({
        target: { value: '42' },
      } as React.ChangeEvent<HTMLInputElement>)
    )
    expect(result.current.audioRef.current?.currentTime).toBe(42)
  })

  it('changes volume on the element and in state', () => {
    const { result } = withElement()
    act(() =>
      result.current.changeVol({
        target: { value: '0.5' },
      } as React.ChangeEvent<HTMLInputElement>)
    )
    expect(result.current.vol).toBe(0.5)
    expect(result.current.audioRef.current?.volume).toBe(0.5)
  })
})
