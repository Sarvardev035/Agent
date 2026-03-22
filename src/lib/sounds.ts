let audioCtx: AudioContext | null = null
let isMuted =
  typeof window !== 'undefined' && window.localStorage.getItem('finly_muted') === 'true'

const getCtx = (): AudioContext => {
  if (typeof window === 'undefined') {
    throw new Error('Audio is only available in the browser')
  }

  if (!audioCtx) {
    const AudioCtor = window.AudioContext
      || ((window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext as
        | typeof AudioContext
        | undefined)

    if (!AudioCtor) {
      throw new Error('Web Audio API is not supported in this browser')
    }

    audioCtx = new AudioCtor()
  }

  if (audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => {})
  }

  return audioCtx
}

const play = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  delay = 0
) => {
  if (isMuted || typeof window === 'undefined') return

  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay)
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)

    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration + 0.05)
  } catch {}
}

export const sounds = {
  income: () => {
    play(523, 0.15, 'sine', 0.25)
    play(659, 0.15, 'sine', 0.25, 0.1)
    play(784, 0.2, 'sine', 0.25, 0.2)
  },

  expense: () => {
    play(523, 0.12, 'sine', 0.2)
    play(440, 0.12, 'sine', 0.2, 0.1)
    play(349, 0.18, 'sine', 0.2, 0.2)
  },

  success: () => {
    play(523, 0.1, 'sine', 0.2)
    play(659, 0.1, 'sine', 0.2, 0.08)
    play(784, 0.1, 'sine', 0.2, 0.16)
    play(1047, 0.2, 'sine', 0.2, 0.24)
  },

  error: () => {
    play(200, 0.15, 'sawtooth', 0.15)
    play(180, 0.2, 'sawtooth', 0.15, 0.15)
  },

  budgetWarning: () => {
    play(440, 0.1, 'sine', 0.2)
    play(440, 0.1, 'sine', 0.2, 0.15)
    play(440, 0.15, 'sine', 0.2, 0.3)
  },

  notification: () => {
    play(800, 0.2, 'sine', 0.15)
    play(1000, 0.3, 'sine', 0.1, 0.1)
  },

  frog: () => {
    if (isMuted || typeof window === 'undefined') return

    try {
      const ctx = getCtx()

      const makeRibbit = (startTime: number) => {
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()

        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)

        osc1.type = 'sawtooth'
        osc2.type = 'square'

        osc1.frequency.setValueAtTime(180, ctx.currentTime + startTime)
        osc1.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + startTime + 0.08)
        osc2.frequency.setValueAtTime(200, ctx.currentTime + startTime)
        osc2.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + startTime + 0.08)

        gain.gain.setValueAtTime(0.18, ctx.currentTime + startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + 0.12)

        osc1.start(ctx.currentTime + startTime)
        osc1.stop(ctx.currentTime + startTime + 0.15)
        osc2.start(ctx.currentTime + startTime)
        osc2.stop(ctx.currentTime + startTime + 0.15)
      }

      makeRibbit(0)
      makeRibbit(0.2)
    } catch {}
  },

  transfer: () => {
    play(440, 0.15, 'sine', 0.2)
    play(554, 0.15, 'sine', 0.2, 0.15)
  },

  click: () => {
    play(600, 0.08, 'sine', 0.1)
  },

  toggleMute: (): boolean => {
    isMuted = !isMuted
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('finly_muted', String(isMuted))
    }
    if (!isMuted) sounds.click()
    return isMuted
  },

  getMuted: (): boolean => isMuted,
}
