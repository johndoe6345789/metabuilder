import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { MAX_AUDIO_RECONNECTS, useLiveAudio } from './use-live-audio'

const SRC = 'http://media.test/stream/radio1'

let audio: HTMLAudioElement
let ref: { current: HTMLAudioElement | null }

const mount = (src = SRC, isLive = true) =>
  renderHook(() => useLiveAudio(ref, src, isLive))

const drop = async (event = 'error') => {
  act(() => {
    audio.dispatchEvent(new Event(event))
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000)
  })
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  audio = document.createElement('audio')
  audio.load = vi.fn()
  audio.play = vi.fn(() => Promise.resolve())
  ref = { current: audio }
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * A live stream is an open connection and any blip ends it -- the
 * element fires `error`, or `ended`, which for live means the connection
 * dropped. Nothing listened to either, so the play button went back to
 * paused and the listener was left thinking it stopped by itself.
 */
describe('useLiveAudio', () => {
  it.each(['error', 'ended'])('reconnects after %s', async event => {
    mount()

    await drop(event)

    expect(audio.load).toHaveBeenCalled()
    expect(audio.play).toHaveBeenCalled()
  })

  it('says so once it has stopped trying', async () => {
    const view = mount()

    for (let i = 0; i <= MAX_AUDIO_RECONNECTS; i += 1) await drop()

    expect(view.result.current.error).toContain('would not come back')
  })

  it('says nothing while it is still trying', async () => {
    const view = mount()

    await drop()

    expect(view.result.current.error).toBeNull()
  })

  it('starts counting again once it is playing', async () => {
    const view = mount()
    for (let i = 0; i < MAX_AUDIO_RECONNECTS; i += 1) await drop()

    act(() => {
      audio.dispatchEvent(new Event('playing'))
    })
    for (let i = 0; i < MAX_AUDIO_RECONNECTS; i += 1) await drop()

    expect(view.result.current.error).toBeNull()
  })

  /** Reloading a normal track would restart it from the beginning, which
   *  is not a repair. */
  it('leaves a recorded track alone', async () => {
    mount(SRC, false)

    await drop()

    expect(audio.load).not.toHaveBeenCalled()
  })

  it('stops listening when the player goes away', async () => {
    const view = mount()

    view.unmount()
    await drop()

    expect(audio.load).not.toHaveBeenCalled()
  })
})
