# Form Fields Quick Reference Table

## All Form Fields Summary

| Form | Field | Type | Required | Default | Notes |
|------|-------|------|----------|---------|-------|
| **EXPENSES** | amount | number | ✓ | — | min="0", step="any" |
| | expenseDate | date | ✓ | today | ISO format YYYY-MM-DD |
| | category | select | ✓ | — | Loaded from API |
| | currency | select | ✓ | UZS | Auto-selects from account if chosen |
| | account | select | ✓ | — | Drives currency selection |
| | description | text | ✗ | — | Optional |
| **INCOME** | amount | number | ✓ | — | min="0", step="any" |
| | incomeDate | date | ✓ | today | ISO format YYYY-MM-DD |
| | category | select | ✓ | — | Loaded from API |
| | currency | select | ✓ | UZS | Auto-selects from account if chosen |
| | account | select | ✓ | — | Drives currency selection |
| | description | text | ✗ | — | Optional |
| **TRANSFERS** | amount | number | ✓ | — | min="0", step="any" |
| | fromAccountId | select | ✓ | — | Must differ from toAccountId |
| | toAccountId | select | ✓ | — | Must differ from fromAccountId |
| | transferDate | date | ✓ | today | ISO format YYYY-MM-DD |
| | exchangeRate | number | ✗ | 1 | Used if currencies differ |
| | description | text | ✗ | — | Optional |
| **DEBTS** | personName | text | ✓ | — | Person's name |
| | amount | number | ✓ | — | min="0", step="any" |
| | currency | select | ✓ | UZS | Manual selection (UZS, USD, EUR) |
| | dueDate | date | ✓ | today | ISO format YYYY-MM-DD |
| | type | radio/button | ✓ | DEBT | DEBT or RECEIVABLE |
| | accountId | select | ✗ | — | Optional, linked account |
| | description | textarea | ✗ | — | Optional, rows=3 |
| **BUDGET - MONTHLY** | monthlyLimit | number | ✓ | — | Must be > 0 |
| | currency | select | ✓ | UZS | Manual selection |
| **BUDGET - CATEGORY** | categoryId | select | ✓ | — | From expense categories |
| | monthlyLimit | number | ✓ | — | Must be > 0, min="1" |
| | currency | select | ✓ | UZS | Manual selection |
| **DEBTS - REPAY** | paymentAmount | number | ✓ | — | Amount to repay |
| | accountId | select | ✗ | — | Optional account |

---

## Validation Rules

### Expenses
```
Required: amount, expenseDate, categoryId, accountId
Validation: Non-empty check only
Error message: "Please fill amount, date, category, account, and currency"
```

### Income
```
Required: amount, incomeDate, categoryId, accountId
Validation: Non-empty check only
Error message: "Please fill amount, date, account, category, and currency"
```

### Transfers
```
Required: amount, fromAccountId, toAccountId
Validation: 
  1. Non-empty check
  2. fromAccountId !== toAccountId
Error messages:
  1. "Fill all required fields"
  2. "Choose different accounts"
```

### Debts
```
Required: personName, amount
Validation: Non-empty check only
Error message: "Please fill person and amount"
```

### Budget (Monthly)
```
Required: monthlyLimit
Validation: 
  1. Parsed as number
  2. > 0
Error message: "Enter a valid budget amount"
```

### Budget (Category)
```
Required: categoryId, monthlyLimit
Validation:
  1. categoryId must be selected
  2. monthlyLimit must be > 0
Error messages:
  1. "Please select a category"
  2. "Limit must be positive"
```

### Debts (Repayment)
```
Required: paymentAmount
Validation: > 0
Error message: "Enter repayment amount"
```

---

## POST Body Signatures

### expensesApi.create()
```typescript
{
  amount: number,
  expenseDate: string (YYYY-MM-DD),
  description: string,
  categoryId: string,
  accountId: string,
  currency: string
}
```

### incomeApi.create()
```typescript
{
  amount: number,
  incomeDate: string (YYYY-MM-DD),
  description: string,
  categoryId: string,
  accountId: string,
  currency: string
}
```

### transfersApi.create()
```typescript
{
  amount: number,
  fromAccountId: string,
  toAccountId: string,
  description: string,
  transferDate: string (YYYY-MM-DD),
  exchangeRate: number
}
```

### debtsApi.create()
```typescript
{
  personName: string,
  amount: number,
  currency: 'USD' | 'EUR' | 'UZS',
  dueDate: string (YYYY-MM-DD),
  type: 'DEBT' | 'RECEIVABLE',
  description: string,
  accountId?: string | undefined
}
```

### debtsApi.repay()
```typescript
debtsApi.repay(debtId: string, {
  paymentAmount: number,
  accountId?: string | undefined
})
```

### budgetApi.set()
```typescript
{
  monthlyLimit: number,
  type: 'MONTHLY',
  currency: string (UZS | USD | EUR),
  year: number,
  month: number
}
```

### budgetApi.setCategory()
```typescript
{
  categoryId: string,
  monthlyLimit: number,
  type: 'MONTHLY',
  currency: string (UZS | USD | EUR),
  year: number,
  month: number
}
```

---

## Component Files

| Component | File | Purpose |
|-----------|------|---------|
| Modal | `src/components/ui/Modal.tsx` | Generic modal wrapper |
| ConfirmDialog | `src/components/ui/ConfirmDialog.tsx` | Used for delete confirmations |
| EmptyState | `src/components/ui/EmptyState.tsx` | Shown when no data exists |
| TransactionItem | `src/components/ui/TransactionItem.tsx` | List item display |
| ProgressRing | `src/components/ui/ProgressRing.tsx` | Circular progress (Budget) |
| ProgressBar | `src/components/ui/ProgressBar.tsx` | Linear progress (Category limits) |

---

## Currency Behavior

### Auto-Currency Selection (Expenses & Income)
- When user selects an account, currency field auto-updates to account's currency
- Currency select becomes disabled (opacity: 0.6)
- Helper text appears: "Currency auto-selected from account"

### Manual Currency Selection (Debts & Budget)
- User must manually select currency
- Always enabled
- Options: UZS, USD, EUR

### Exchange Rate Handling (Transfers)
- If `fromAccount.currency !== toAccount.currency`:
  - Exchange rate field becomes relevant
  - Live preview shows converted amount
  - ConvertedAmount = amount × exchangeRate
- If currencies match:
  - Message shows: "Rates default to 1 when currencies match."
  - exchangeRate defaults to 1

---

## Date Handling

All date fields:
- Use HTML5 `type="date"` input
- Store as ISO string: `YYYY-MM-DD`
- Default to current date: `format(new Date(), 'yyyy-MM-dd')`
- Are required except for optional fields

Budget fields include:
- Current year: `new Date().getFullYear()`
- Current month: `new Date().getMonth() + 1`

---

## Status Tracking (Debts Only)

### Debt Status Values
- `OPEN` - Active debt/receivable
- `CLOSED` - Paid/settled debt/receivable

### Due Date Status
- **Overdue**: days < 0 → Red badge "Xd overdue"
- **Upcoming**: days ≥ 0 → Amber badge "Xd left"

### Display Logic
```typescript
const days = differenceInCalendarDays(dueDate, today)
if (days < 0) {
  // Overdue: show red "Xd overdue"
}
// Not overdue: show amber "Xd left"
```

---

## Form Reset Patterns

### After Successful Submit

**Expenses/Income:**
```typescript
setFormData({
  amount: '',
  [dateField]: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  categoryId: '',
  accountId: '',
  currency: 'UZS',
})
```

**Transfers:**
```typescript
setForm({
  amount: '',
  fromAccountId: '',
  toAccountId: '',
  description: '',
  transferDate: format(new Date(), 'yyyy-MM-dd'),
  exchangeRate: '1',
})
```

**Debts:**
```typescript
setForm(prev => ({ ...prev, amount: '', description: '' }))
// Note: Only clears amount and description, keeps other fields
```

**Budget Goal:**
```typescript
setGoalModal(false)
setIncomeGoal(parsed)
```

**Budget Category:**
```typescript
setCategoryModal(false)
setCategoryLimit('')
setSelectedCategory('')
setCategoryCurrency('UZS')
```

---

## Error Handling

All forms follow pattern:
```typescript
try {
  // API call
  toast.success('Success message')
  setModalOpen(false)
  // Reset form
  // Refresh data
} catch (err) {
  console.error(err)
  toast.error('Failed to [action]')
}
```

Toast notifications use `react-hot-toast` library.
