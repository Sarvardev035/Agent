export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const message = body.message

    if (!message || typeof message.text !== 'string') {
      return res.status(200).json({ ok: true })
    }

    const chatId = message?.chat?.id
    const userText = String(message.text || '')

    if (chatId === undefined || chatId === null) {
      return res.status(200).json({ ok: true })
    }

    if (String(chatId) !== String(process.env.TELEGRAM_CHAT_ID || '')) {
      return res.status(200).json({ ok: true })
    }

    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) {
      console.error('Missing TELEGRAM_BOT_TOKEN')
      return res.status(200).json({ ok: true })
    }

    const replyText = `✅ Bot is alive! You said: "${userText}"`

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
      }),
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Webhook Error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
