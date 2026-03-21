import DOMPurify from 'dompurify'
import { z } from 'zod'

// ── Token Security ──────────────────────────────────────────────

export const TokenStorage = {
  KEY: 'finly_auth_token',
  EXPIRY_KEY: 'finly_token_expiry',

  set(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiryMs = payload.exp ? payload.exp * 1000 : Date.now() + 86400000
      localStorage.setItem(TokenStorage.KEY, token)
      localStorage.setItem(TokenStorage.EXPIRY_KEY, String(expiryMs))
    } catch {
      console.error('Malformed token rejected')
    }
  },

  get(): string | null {
    const token = localStorage.getItem(TokenStorage.KEY)
    const expiry = localStorage.getItem(TokenStorage.EXPIRY_KEY)
    if (!token || !expiry) return null
    if (Date.now() > Number(expiry)) {
      TokenStorage.clear()
      return null
    }
    return token
  },

  clear(): void {
    localStorage.removeItem(TokenStorage.KEY)
    localStorage.removeItem(TokenStorage.EXPIRY_KEY)
  },

  isValid(): boolean {
    return TokenStorage.get() !== null
  },
}

// ── XSS Prevention ──────────────────────────────────────────────

export const sanitize = (dirty: string): string =>
  DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })

// ── Input Validation Schemas (Zod) ──────────────────────────────

export const LoginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255)
    .transform(v => v.toLowerCase().trim()),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128),
})

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100).transform(v => sanitize(v.trim())),
  email: z.string().email().max(255).transform(v => v.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

export const ExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(999_999_999),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string().max(500).transform(v => sanitize(v.trim())).optional(),
  category: z.enum(['FOOD','TRANSPORT','HEALTH','ENTERTAINMENT','UTILITIES','OTHER']),
  accountId: z.number().positive(),
})

export const IncomeSchema = z.object({
  amount: z.number().positive().max(999_999_999),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(500).transform(v => sanitize(v.trim())).optional(),
  category: z.enum(['SALARY','FREELANCE','BUSINESS','INVESTMENT','GIFT','OTHER']),
  accountId: z.number().positive(),
})

export const AccountSchema = z.object({
  name: z.string().min(1).max(100).transform(v => sanitize(v.trim())),
  type: z.enum(['CARD','CASH','BANK']),
  currency: z.enum(['UZS','USD','EUR','RUB']),
  balance: z.number().min(0).max(999_999_999),
})

export const TransferSchema = z.object({
  fromAccountId: z.number().positive(),
  toAccountId: z.number().positive(),
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(200).optional(),
}).refine(d => d.fromAccountId !== d.toAccountId, {
  message: 'Cannot transfer to the same account',
})

export const DebtSchema = z.object({
  personName: z.string().min(1).max(100).transform(v => sanitize(v.trim())),
  amount: z.number().positive(),
  currency: z.enum(['UZS','USD','EUR','RUB']),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['LENT','BORROWED']),
  description: z.string().max(500).transform(v => sanitize(v.trim())).optional(),
})

export type LoginInput    = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type ExpenseInput  = z.infer<typeof ExpenseSchema>
export type IncomeInput   = z.infer<typeof IncomeSchema>
export type AccountInput  = z.infer<typeof AccountSchema>
export type TransferInput = z.infer<typeof TransferSchema>
export type DebtInput     = z.infer<typeof DebtSchema>

// ── Rate Limiting ────────────────────────────────────────────────

export class RateLimiter {
  private attempts: number[] = []
  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}

  canProceed(): boolean {
    const now = Date.now()
    this.attempts = this.attempts.filter(t => now - t < this.windowMs)
    if (this.attempts.length >= this.maxAttempts) return false
    this.attempts.push(now)
    return true
  }

  getRemainingMs(): number {
    if (this.attempts.length === 0) return 0
    return this.windowMs - (Date.now() - this.attempts[0])
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000)
