const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

const buildUrl = (method: string) => `https://api.telegram.org/bot${BOT_TOKEN}/${method}`

const ensureConfigured = () => {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[telegram] Missing BOT_TOKEN or CHAT_ID')
    return false
  }
  return true
}

const sendMessage = async (text: string): Promise<void> => {
  if (!ensureConfigured()) return
  const payload = {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'HTML' as const,
  }

  const res = await fetch(buildUrl('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[telegram] sendMessage failed', res.status, body)
  }
}

export const telegramService = {
  sendMessage,
}
