const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

const ACTIVE_KEY = 'finly_accessibility_active'

let _active = (() => {
  try { return localStorage.getItem(ACTIVE_KEY) === 'true' } catch { return false }
})()

let _utterance: SpeechSynthesisUtterance | null = null

export const screenReader = {
  get isActive() {
    return _active
  },

  speak(text: string, interrupt = false) {
    if (!_active || !synth) return
    if (interrupt && synth.speaking) synth.cancel()
    _utterance = new SpeechSynthesisUtterance(text)
    _utterance.rate = 1.1
    _utterance.pitch = 1
    synth.speak(_utterance)
  },

  stop() {
    if (synth) synth.cancel()
  },

  enable() {
    _active = true
    try { localStorage.setItem(ACTIVE_KEY, 'true') } catch {}
    // Dispatch custom event so AccessibilityBar can react
    window.dispatchEvent(new CustomEvent('accessibility-changed', { detail: true }))
  },

  disable() {
    _active = false
    try { localStorage.setItem(ACTIVE_KEY, 'false') } catch {}
    if (synth) synth.cancel()
    window.dispatchEvent(new CustomEvent('accessibility-changed', { detail: false }))
  },
}
