type SummaryLike = {
  totalBalance?: number
  totalIncome?: number
  totalExpense?: number
  savings?: number
}

let isActive = false
let synth: SpeechSynthesis | null = null
let voice: SpeechSynthesisVoice | null = null

const getVoice = (): SpeechSynthesisVoice | null => {
  if (!window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null
}

export const screenReader = {
  isActive: () => isActive,

  enable: () => {
    isActive = true
    localStorage.setItem('finly_accessibility', 'true')
    synth = window.speechSynthesis
    voice = getVoice()
    window.speechSynthesis.onvoiceschanged = () => {
      voice = getVoice()
    }
    screenReader.speak(
      'Accessibility mode enabled. I will read all content aloud. ' +
        'You are on the Finly personal finance app. Use Tab key to navigate between elements. ' +
        'Press Enter to activate buttons.',
      true
    )
  },

  disable: () => {
    if (synth) synth.cancel()
    isActive = false
    localStorage.setItem('finly_accessibility', 'false')
    screenReader.speak('Accessibility mode disabled.', true)
  },

  speak: (text: string, priority = false) => {
    if (!window.speechSynthesis) return
    if (!isActive && !priority) return
    if (priority) {
      window.speechSynthesis.cancel()
    }
    const utt = new SpeechSynthesisUtterance(text)
    utt.voice = voice
    utt.rate = 0.9
    utt.pitch = 1.0
    utt.volume = 1.0
    window.speechSynthesis.speak(utt)
  },

  stop: () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  },

  readDashboard: (summary: SummaryLike) => {
    if (!isActive) return
    const text = [
      'Dashboard overview.',
      `Total balance: ${summary?.totalBalance ?? 0} UZS.`,
      `Income this month: ${summary?.totalIncome ?? 0}.`,
      `Expenses this month: ${summary?.totalExpense ?? 0}.`,
      `Net savings: ${summary?.savings ?? 0}.`,
    ].join(' ')
    screenReader.speak(text)
  },
}

export const initAccessibility = () => {
  const saved = localStorage.getItem('finly_accessibility')
  if (saved === 'true') screenReader.enable()
}

