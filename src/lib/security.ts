import DOMPurify from 'dompurify'
import { z } from 'zod'
import { CARD_TYPE_VALUES } from './constants'

// ── Token Security ──────────────────────────────────────────────

export const TokenStorage = {
  KEY: 'finly_access_token',
  set: (token: string): void => {
    localStorage.setItem(TokenStorage.KEY, token)
  },
  get: (): string | null => localStorage.getItem(TokenStorage.KEY),
  clear: () => {
    localStorage.removeItem('finly_access_token')
    localStorage.removeItem('finly_refresh_token')
  },
  isValid: () => !!TokenStorage.get(),
}

// ── XSS Prevention ──────────────────────────────────────────────

export const sanitize = (s: string): string =>
  DOMPurify.sanitize(s, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })

export const CARD_NUMBER_LENGTH = 16

export const sanitizeCardNumber = (value: string): string =>
  value.replace(/\D/g, '').slice(0, CARD_NUMBER_LENGTH)

export const getCardNumberError = (value: string): string | null => {
  const cardNumber = sanitizeCardNumber(value)

  if (!cardNumber) return 'Card number is required'
  if (/^0{16}$/.test(cardNumber)) return 'Card number cannot be all zeros'
  if (cardNumber.startsWith('0')) return 'Card number cannot start with 0'
  if (cardNumber.length !== CARD_NUMBER_LENGTH) return 'Card number must be exactly 16 digits'

  return null
}

// ── Input Validation Schemas (Zod) ──────────────────────────────

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255)
    .transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128),
})

export const RegisterSchema = z.object({
  fullName: z.string().min(1).max(100).transform(v => sanitize(v.trim())),
  email: z.string().email().max(255).transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

export const ExpenseSchema = z.object({
  amount: z.number().positive().max(999_999_999),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z
    .string()
    .max(500)
    .optional()
    .transform(v => (v ? sanitize(v) : v)),
  categoryId: z.string().min(1),
  accountId: z.string().min(1),
})

export const IncomeSchema = z.object({
  amount: z.number().positive().max(999_999_999),
  incomeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z
    .string()
    .max(500)
    .optional()
    .transform(v => (v ? sanitize(v) : v)),
  categoryId: z.string().min(1),
  accountId: z.string().min(1),
})

export const AccountSchema = z.object({
  name: z.string().min(1).max(100).transform(v => sanitize(v.trim())),
  type: z.enum(['BANK_CARD', 'CASH']),
  currency: z.enum(['UZS', 'USD', 'EUR']),
  initialBalance: z.number().min(0),
  cardNumber: z.string().optional().transform(v => (v ? sanitizeCardNumber(v) : v)),
  cardType: z.enum(CARD_TYPE_VALUES).optional(),
}).superRefine((data, ctx) => {
  if (data.type !== 'BANK_CARD') return

  if (!data.cardType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cardType'],
      message: 'Card type is required for BANK_CARD accounts',
    })
  }

  const error = getCardNumberError(data.cardNumber ?? '')
  if (!error) return

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ['cardNumber'],
    message: error,
  })
})

export const TransferSchema = z
  .object({
    fromAccountId: z.string().min(1),
    toAccountId: z.string().min(1),
    amount: z.number().positive(),
    transferDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string().max(200).optional().transform(v => (v ? sanitize(v) : v)),
    exchangeRate: z.number().positive(),
  })
  .refine(d => d.fromAccountId !== d.toAccountId, {
    message: 'Cannot transfer to the same account',
  })

export const DebtSchema = z.object({
  personName: z
    .string()
    .min(1)
    .max(100)
    .transform(v => sanitize(v.trim())),
  amount: z.number().positive(),
  currency: z.enum(['UZS', 'USD', 'EUR']),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['DEBT', 'RECEIVABLE']),
  description: z
    .string()
    .max(500)
    .optional()
    .transform(v => (v ? sanitize(v) : v)),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type ExpenseInput = z.infer<typeof ExpenseSchema>
export type IncomeInput = z.infer<typeof IncomeSchema>
export type AccountInput = z.infer<typeof AccountSchema>
export type TransferInput = z.infer<typeof TransferSchema>
export type DebtInput = z.infer<typeof DebtSchema>

// ── Rate Limiting ────────────────────────────────────────────────

export class RateLimiter {
  private attempts: number[] = []
  constructor(private maxAttempts: number, private windowMs: number) {}

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
