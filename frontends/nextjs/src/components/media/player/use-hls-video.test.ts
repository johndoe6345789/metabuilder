import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

import { fakeHls } from './fake-hls'
import { MAX_NETWORK_RETRIES, NETWORK_ERROR, MEDIA_ERROR } from './hls-recovery'
import { useHlsVideo } from './use-hls-video'

const SRC = 'http://media.test/hls/tv/ch1/stream.m3u8'

let hls: ReturnType<typeof fakeHls>
let video: HTMLVideoElement

const loader = () => Promise.resolve({ default: hls.Ctor })

const mount = (src = SRC, autoPlay = false) =>
  renderHook(() => useHlsVideo(video, src, { autoPlay, loader }))

const started = async () => {
  const view = mount()
  await waitFor(() => {
    expect(hls.instances).toHaveLength(1)
  })
  return { view, instance: hls.instances[0] }
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  hls = fakeHls()
  video = document.createElement('video')
  video.play = vi.fn(() => Promise.resolve())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('starting playback', () => {
  it('loads the source and attaches the video', async () => {
    const { instance } = await started()
    expect(instance.loadSource).toHaveBeenCalledWith(SRC)
    expect(instance.attachMedia).toHaveBeenCalledWith(video)
  })

  /**
   * hls.js leaves `liveMaxLatencyDurationCount` unset, and unset means it
   * never seeks forward -- so a stream that fell behind stayed behind for
   * the rest of the session. That is "live TV was not live".
   */
  it('configures hls.js to catch up when it drifts', async () => {
    const { instance } = await started()
    expect(instance.config.liveMaxLatencyDurationCount).toBe(10)
  })

  it('plays once the manifest is ready, when asked to', async () => {
    mount(SRC, true)
    await waitFor(() => {
      expect(hls.instances).toHaveLength(1)
    })
    act(() => {
      hls.instances[0].emitManifestParsed()
    })
    expect(video.play).toHaveBeenCalled()
  })

  it('does not play uninvited', async () => {
    const { instance } = await started()
    act(() => {
      instance.emitManifestParsed()
    })
    expect(video.play).not.toHaveBeenCalled()
  })
})

/**
 * The player attached hls.js and listened to nothing, so one segment 404
 * as the live window rolled stopped the stream for good and said nothing.
 */
describe('when the stream goes wrong', () => {
  it('reloads after a fatal network error', async () => {
    const { instance } = await started()

    act(() => {
      instance.emitError({ fatal: true, type: NETWORK_ERROR })
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })

    expect(instance.startLoad).toHaveBeenCalled()
  })

  it('recovers the decoder after a fatal media error', async () => {
    const { instance } = await started()

    act(() => {
      instance.emitError({ fatal: true, type: MEDIA_ERROR })
    })

    expect(instance.recoverMediaError).toHaveBeenCalled()
  })

  it('leaves a non-fatal error alone', async () => {
    const { instance } = await started()

    act(() => {
      instance.emitError({ fatal: false, type: NETWORK_ERROR })
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(instance.startLoad).not.toHaveBeenCalled()
  })

  it('tells the viewer once it has stopped trying', async () => {
    const { view, instance } = await started()

    for (let i = 0; i <= MAX_NETWORK_RETRIES; i += 1) {
      act(() => {
        instance.emitError({ fatal: true, type: NETWORK_ERROR })
      })
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000)
      })
    }

    expect(view.result.current.error).toContain('not sending it any more')
  })

  it('says nothing while it is still recovering', async () => {
    const { view, instance } = await started()

    act(() => {
      instance.emitError({ fatal: true, type: NETWORK_ERROR })
    })

    expect(view.result.current.error).toBeNull()
  })
})

describe('catching up with the live edge', () => {
  it('seeks forward when a stall has left it behind', async () => {
    const { instance } = await started()
    instance.liveSyncPosition = 300
    video.currentTime = 120

    act(() => {
      video.dispatchEvent(new Event('waiting'))
    })

    expect(video.currentTime).toBe(300)
  })

  it('leaves playback alone when it is near the edge', async () => {
    const { instance } = await started()
    instance.liveSyncPosition = 305
    video.currentTime = 300

    act(() => {
      video.dispatchEvent(new Event('waiting'))
    })

    expect(video.currentTime).toBe(300)
  })

  it('does nothing for a stream with no live edge', async () => {
    await started()
    video.currentTime = 10

    act(() => {
      video.dispatchEvent(new Event('waiting'))
    })

    expect(video.currentTime).toBe(10)
  })
})

describe('leaving', () => {
  it('destroys the player, so a channel switch cannot leave two running', async () => {
    const { view, instance } = await started()

    view.unmount()

    expect(instance.destroy).toHaveBeenCalled()
  })

  it('stops listening to the video element', async () => {
    const { view, instance } = await started()
    instance.liveSyncPosition = 300
    video.currentTime = 10

    view.unmount()
    video.dispatchEvent(new Event('waiting'))

    expect(video.currentTime).toBe(10)
  })
})
