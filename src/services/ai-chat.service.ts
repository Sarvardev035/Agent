import { AI_API_BASE_URL, AI_API_KEY, AI_MODEL } from '../lib/config'

export type ChatActionType = 'NAVIGATE' | 'ADD_EXPENSE' | 'ADD_DEBT' | 'NONE'

export type ChatAction = {
  type: ChatActionType
  path?: string
  data?: {
    amount?: number
    currency?: 'USD' | 'EUR' | 'UZS'
    description?: string
    expenseDate?: string
    categoryHint?: string
    accountHint?: string
    personName?: string
    debtType?: 'DEBT' | 'RECEIVABLE'
    dueDate?: string
  }
}

export type ChatAssistantResult = {
  reply: string
  action: ChatAction
}

const SYSTEM_PROMPT = `
You are Finly assistant for personal finance.
You must output strict JSON only with shape:
{
  "reply": string,
  "action": {
    "type": "NAVIGATE" | "ADD_EXPENSE" | "ADD_DEBT" | "NONE",
    "path"?: string,
    "data"?: {
      "amount"?: number,
      "currency"?: "USD" | "EUR" | "UZS",
      "description"?: string,
      "expenseDate"?: "YYYY-MM-DD",
      "categoryHint"?: string,
      "accountHint"?: string,
      "personName"?: string,
      "debtType"?: "DEBT" | "RECEIVABLE",
      "dueDate"?: "YYYY-MM-DD"
    }
  }
}

Rules:
- If user asks to open page/screen, use NAVIGATE with one of:
  /dashboard /expenses /income /transfers /debts /budget /statistics /calendar /accounts /categories /notes /community
- If user describes spending (buy, spent, paid for), use ADD_EXPENSE.
- If user says borrowed/took money and will return, use ADD_DEBT debtType=DEBT.
- If user says gave/lent money and expects return, use ADD_DEBT debtType=RECEIVABLE.
- For relative dates (today/tomorrow/next monday), convert to YYYY-MM-DD using current local date context.
- Keep reply friendly and concise like a normal person.
- Never include markdown fences or extra text; JSON only.
`.trim()

const extractJson = (text: string): string => {
  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first === -1 || last === -1 || last <= first) return ''
  return text.slice(first, last + 1)
}

export const aiChatService = {
  isConfigured: (): boolean => AI_API_KEY.trim().length > 0,

  async respond(userText: string): Promise<ChatAssistantResult> {
    if (!this.isConfigured()) {
      return {
        reply: 'AI key is not configured yet. Add VITE_AI_API_KEY in .env.local and restart the app.',
        action: { type: 'NONE' },
      }
    }

    const res = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userText },
        ],
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`AI request failed: ${res.status} ${text}`)
    }

    const payload = await res.json()
    const content = String(payload?.choices?.[0]?.message?.content ?? '')
    const parsed = JSON.parse(extractJson(content) || '{}') as ChatAssistantResult

    return {
      reply: parsed?.reply || 'Done. Tell me what you want to do next.',
      action: parsed?.action || { type: 'NONE' },
    }
  },
}

