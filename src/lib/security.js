import DOMPurify from 'dompurify';
import { z } from 'zod';
import { CARD_TYPE_VALUES } from './constants';
// ── Token Security ──────────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'finly_access_token';
const REFRESH_TOKEN_KEY = 'finly_refresh_token';
const USER_NAME_KEY = 'finly_user_name';
const USER_EMAIL_KEY = 'finly_user_email';
const canUseStorage = () => typeof window !== 'undefined';
const readSessionFirst = (key) => {
    if (!canUseStorage())
        return null;
    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue)
        return sessionValue;
    const legacyValue = window.localStorage.getItem(key);
    if (!legacyValue)
        return null;
    window.sessionStorage.setItem(key, legacyValue);
    window.localStorage.removeItem(key);
    return legacyValue;
};
const writeSession = (key, value) => {
    if (!canUseStorage())
        return;
    window.sessionStorage.setItem(key, value);
    window.localStorage.removeItem(key);
};
const clearEverywhere = (key) => {
    if (!canUseStorage())
        return;
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
};
const isJwtExpired = (token) => {
    try {
        if (!token)
            return true;
        const [, payload] = token.split('.');
        if (!payload)
            return false;
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(normalized));
        if (typeof decoded?.exp !== 'number')
            return false;
        return Date.now() >= decoded.exp * 1000;
    }
    catch {
        return false;
    }
};
export const TokenStorage = {
    KEY: ACCESS_TOKEN_KEY,
    set: (token) => {
        writeSession(TokenStorage.KEY, token);
    },
    get: () => readSessionFirst(TokenStorage.KEY),
    setRefreshToken: (token) => {
        writeSession(REFRESH_TOKEN_KEY, token);
    },
    getRefreshToken: () => readSessionFirst(REFRESH_TOKEN_KEY),
    setTokens: (accessToken, refreshToken) => {
        TokenStorage.set(accessToken);
        if (refreshToken)
            TokenStorage.setRefreshToken(refreshToken);
    },
    clear: () => {
        clearEverywhere(ACCESS_TOKEN_KEY);
        clearEverywhere(REFRESH_TOKEN_KEY);
    },
    isValid: () => {
        const accessToken = TokenStorage.get();
        if (accessToken && !isJwtExpired(accessToken))
            return true;
        return Boolean(TokenStorage.getRefreshToken());
    },
};
export const UserProfileStorage = {
    set: (profile) => {
        if (profile.name)
            writeSession(USER_NAME_KEY, profile.name);
        if (profile.email)
            writeSession(USER_EMAIL_KEY, profile.email);
    },
    get: () => ({
        name: readSessionFirst(USER_NAME_KEY) || '',
        email: readSessionFirst(USER_EMAIL_KEY) || '',
    }),
    clear: () => {
        clearEverywhere(USER_NAME_KEY);
        clearEverywhere(USER_EMAIL_KEY);
    },
};
// ── XSS Prevention ──────────────────────────────────────────────
export const sanitize = (s) => DOMPurify.sanitize(s, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
export const CARD_NUMBER_LENGTH = 16;
export const sanitizeCardNumber = (value) => value.replace(/\D/g, '').slice(0, CARD_NUMBER_LENGTH);
export const getCardNumberError = (value) => {
    const cardNumber = sanitizeCardNumber(value);
    if (!cardNumber)
        return 'Card number is required';
    if (/^0{16}$/.test(cardNumber))
        return 'Card number cannot be all zeros';
    if (cardNumber.startsWith('0'))
        return 'Card number cannot start with 0';
    if (cardNumber.length !== CARD_NUMBER_LENGTH)
        return 'Card number must be exactly 16 digits';
    return null;
};
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
});
export const RegisterSchema = z.object({
    fullName: z.string().min(1).max(100).transform(v => sanitize(v.trim())),
    email: z.string().email().max(255).transform(v => v.toLowerCase().trim()),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[0-9]/, 'Must contain a number'),
});
export const ExpenseSchema = z.object({
    amount: z.number().positive().max(999999999),
    expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z
        .string()
        .max(500)
        .optional()
        .transform(v => (v ? sanitize(v) : v)),
    categoryId: z.string().min(1),
    accountId: z.string().min(1),
});
export const IncomeSchema = z.object({
    amount: z.number().positive().max(999999999),
    incomeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z
        .string()
        .max(500)
        .optional()
        .transform(v => (v ? sanitize(v) : v)),
    categoryId: z.string().min(1),
    accountId: z.string().min(1),
});
export const AccountSchema = z.object({
    name: z.string().min(1).max(100).transform(v => sanitize(v.trim())),
    type: z.enum(['BANK_CARD', 'CASH']),
    currency: z.enum(['UZS', 'USD', 'EUR']),
    initialBalance: z.number().min(0),
    cardNumber: z.string().optional().transform(v => (v ? sanitizeCardNumber(v) : v)),
    cardType: z.enum(CARD_TYPE_VALUES).optional(),
}).superRefine((data, ctx) => {
    if (data.type !== 'BANK_CARD')
        return;
    if (!data.cardType) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cardType'],
            message: 'Card type is required for BANK_CARD accounts',
        });
    }
    const error = getCardNumberError(data.cardNumber ?? '');
    if (!error)
        return;
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cardNumber'],
        message: error,
    });
});
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
});
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
});
// ── Rate Limiting ────────────────────────────────────────────────
export class RateLimiter {
    constructor(maxAttempts, windowMs) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.attempts = [];
    }
    canProceed() {
        const now = Date.now();
        this.attempts = this.attempts.filter(t => now - t < this.windowMs);
        if (this.attempts.length >= this.maxAttempts)
            return false;
        this.attempts.push(now);
        return true;
    }
    getRemainingMs() {
        if (this.attempts.length === 0)
            return 0;
        return this.windowMs - (Date.now() - this.attempts[0]);
    }
}
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);
