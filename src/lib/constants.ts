// Account types — must match backend enum EXACTLY
export const ACCOUNT_TYPES = [
  { value: 'CASH', valueLabel: 'CASH', label: 'Cash', icon: '💵' },
  { value: 'BANK_CARD', valueLabel: 'BANK_CARD', label: 'Card', icon: '💳' },
] as const

export const CARD_TYPE_VALUES = ['UZCARD', 'HUMO', 'VISA', 'MASTERCARD'] as const

export const CARD_TYPES = [
  { value: 'UZCARD', label: 'Uzcard' },
  { value: 'HUMO', label: 'Humo' },
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'Mastercard' },
] as const

// Expense categories — must match backend enum EXACTLY
export const EXPENSE_CATEGORIES = [
  { value: 'FOOD', label: 'Food', emoji: '🍔' },
  { value: 'TRANSPORT', label: 'Transport', emoji: '🚗' },
  { value: 'HEALTH', label: 'Health', emoji: '💊' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', emoji: '🎮' },
  { value: 'UTILITIES', label: 'Utilities', emoji: '⚡' },
  { value: 'OTHER', label: 'Other', emoji: '📦' },
] as const

// Income categories — must match backend enum EXACTLY
export const INCOME_CATEGORIES = [
  { value: 'SALARY', label: 'Salary', emoji: '💰' },
  { value: 'FREELANCE', label: 'Freelance', emoji: '💼' },
  { value: 'BUSINESS', label: 'Business', emoji: '🏢' },
  { value: 'INVESTMENT', label: 'Investment', emoji: '📈' },
  { value: 'GIFT', label: 'Gift', emoji: '🎁' },
  { value: 'OTHER', label: 'Other', emoji: '📦' },
] as const

// Debt types
export const DEBT_TYPES = [
  { value: 'DEBT', label: 'I owe' },
  { value: 'RECEIVABLE', label: 'Owed to me' },
] as const

// Currencies
// Backend supports only EUR, USD, UZS
export const CURRENCIES = ['UZS', 'USD', 'EUR'] as const
