# Form Fields Audit Report

## Summary
This document details all form fields, validation logic, required vs optional status, and POST body structures across the finance application.

---

## 1. EXPENSES FORM

### File: [src/pages/Expenses.tsx](src/pages/Expenses.tsx)

#### Form State Type
**Lines 21-28:**
```typescript
type ExpenseFormState = {
  amount: string
  expenseDate: string
  description: string
  categoryId: string
  accountId: string
  currency: (typeof CURRENCIES)[number]
}
```

#### Initial State
**Lines 46-53:**
```typescript
const [formData, setFormData] = useState<ExpenseFormState>({
  amount: '',
  expenseDate: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  categoryId: '',
  accountId: '',
  currency: 'UZS',
})
```

#### Form Fields in Modal
**Lines 370-429:** Modal component showing all input fields:
- **Amount** (Line 376): `type="number"`, required, placeholder "0.00"
- **Date** (Line 383): `type="date"`, required, auto-filled with today
- **Category** (Line 392): `<select>`, required, options from API
- **Currency** (Line 401): `<select>`, **disabled if accountId selected**, auto-selected from account
- **Account** (Line 425): `<select>`, required
- **Description** (Line 437): `<input type="text">`, optional, placeholder "Optional"

#### Validation Logic
**Lines 127-132:**
```typescript
const handleSubmit = () => {
  setTimeout(async () => {
    if (!formData.amount || !formData.expenseDate || !formData.accountId || !formData.categoryId) {
      toast.error('Please fill amount, date, category, account, and currency')
      return
    }
```

**Required Fields:**
- amount (any truthy value)
- expenseDate (any truthy value)
- accountId (any truthy value)
- categoryId (any truthy value)
- **currency** (implicitly required - always has default 'UZS')

**Optional Fields:**
- description

#### POST Body
**Lines 133-142:**
```typescript
await expensesApi.create({
  amount: Number(formData.amount),
  expenseDate: formData.expenseDate,
  description: formData.description,
  categoryId: formData.categoryId,
  accountId: formData.accountId,
  currency: formData.currency,
})
```

#### Post-Submit Reset
**Lines 147-155:**
```typescript
setFormData({
  amount: '',
  expenseDate: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  categoryId: '',
  accountId: '',
  currency: 'UZS',
})
```

#### Currency Handling
**Lines 114-123:** When account changes, currency auto-updates:
```typescript
const handleChange = (key: keyof ExpenseFormState, value: string) => {
  if (key === 'accountId') {
    const selectedAccount = accounts.find(acc => acc.id === value)
    setFormData(prev => ({
      ...prev,
      accountId: value,
      currency: selectedAccount?.currency || 'UZS',
    }))
```

---

## 2. INCOME FORM

### File: [src/pages/Income.tsx](src/pages/Income.tsx)

#### Form State Type
**Lines 21-28:**
```typescript
type IncomeFormState = {
  amount: string
  incomeDate: string
  description: string
  categoryId: string
  accountId: string
  currency: (typeof CURRENCIES)[number]
}
```

#### Initial State
**Lines 46-53:**
```typescript
const [formData, setFormData] = useState<IncomeFormState>({
  amount: '',
  incomeDate: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  categoryId: '',
  accountId: '',
  currency: 'UZS',
})
```

#### Form Fields in Modal
**Lines 370-433:** Modal component:
- **Amount** (Line 376): `type="number"`, required
- **Date** (Line 383): `type="date"`, required (field name: incomeDate)
- **Category** (Line 392): `<select>`, required
- **Currency** (Line 401): `<select>`, **disabled if accountId selected**
- **Account** (Line 425): `<select>`, required
- **Description** (Line 441): `<input type="text">`, optional

#### Validation Logic
**Lines 127-132:**
```typescript
if (!formData.amount || !formData.incomeDate || !formData.accountId || !formData.categoryId) {
  toast.error('Please fill amount, date, account, category, and currency')
  return
}
```

**Required Fields:**
- amount
- incomeDate
- accountId
- categoryId
- currency (defaults to 'UZS')

**Optional Fields:**
- description

#### POST Body
**Lines 133-142:**
```typescript
await incomeApi.create({
  amount: Number(formData.amount),
  incomeDate: formData.incomeDate,
  description: formData.description,
  categoryId: formData.categoryId,
  accountId: formData.accountId,
  currency: formData.currency,
})
```

#### Currency Handling
**Lines 114-123:** Same as Expenses - auto-selects from account when account changes

---

## 3. TRANSFERS FORM

### File: [src/pages/Transfers.tsx](src/pages/Transfers.tsx)

#### Form State Type
**Lines 16-23:**
```typescript
interface TransferForm {
  amount: string
  fromAccountId: string
  toAccountId: string
  description: string
  transferDate: string
  exchangeRate: string
}
```

#### Initial State
**Lines 35-42:**
```typescript
const [form, setForm] = useState<TransferForm>({
  amount: '',
  fromAccountId: '',
  toAccountId: '',
  description: '',
  transferDate: format(new Date(), 'yyyy-MM-dd'),
  exchangeRate: '1',
})
```

#### Form Fields in Modal
**Lines 170-332:** Modal component with inline field grids:
- **From account** (Lines 176-187): `<select>`, required
- **To account** (Lines 188-199): `<select>`, required, must differ from "From"
- **Amount** (Lines 204-213): `type="number"`, required
- **Date** (Lines 214-221): `type="date"`, required
- **Exchange rate** (Lines 226-233): `type="number"`, optional (defaults to 1)
- **Description** (Lines 237-241): `<input>`, optional

#### Validation Logic
**Lines 52-63:**
```typescript
if (!form.amount || !form.fromAccountId || !form.toAccountId) {
  toast.error('Fill all required fields')
  return
}
if (form.fromAccountId === form.toAccountId) {
  toast.error('Choose different accounts')
  return
}
```

**Required Fields:**
- amount
- fromAccountId
- toAccountId (must be different from fromAccountId)
- transferDate (has default)

**Optional Fields:**
- description
- exchangeRate (defaults to 1)

#### POST Body
**Lines 65-72:**
```typescript
await transfersApi.create({
  amount: Number(form.amount),
  fromAccountId: form.fromAccountId,
  toAccountId: form.toAccountId,
  description: form.description,
  transferDate: form.transferDate,
  exchangeRate: Number(form.exchangeRate) || 1,
})
```

#### Special Logic
**Lines 49-51:** Currency conversion detection:
```typescript
const currenciesDiffer = !!(fromAccount?.currency && toAccount?.currency && fromAccount.currency !== toAccount.currency)
const convertedAmount = useMemo(() => {
  const amt = Number(form.amount)
  const rate = Number(form.exchangeRate) || 1
  return currenciesDiffer ? amt * rate : amt
}, [currenciesDiffer, form.amount, form.exchangeRate])
```

---

## 4. DEBTS FORM

### File: [src/pages/Debts.tsx](src/pages/Debts.tsx)

#### Form State Type
**Lines 19-27:**
```typescript
interface DebtForm {
  personName: string
  amount: string
  currency: string
  dueDate: string
  type: DebtType
  description: string
  accountId: string
}
```

Where `DebtType = 'DEBT' | 'RECEIVABLE'`

#### Initial State
**Lines 42-50:**
```typescript
const [form, setForm] = useState<DebtForm>({
  personName: '',
  amount: '',
  currency: 'UZS',
  dueDate: format(new Date(), 'yyyy-MM-dd'),
  type: 'DEBT',
  description: '',
  accountId: '',
})
```

#### Form Fields in Modal
**Lines 402-537:** Modal component:
- **Person** (Lines 408-413): `<input type="text">`, required
- **Amount** (Lines 414-421): `<input type="number">`, required
- **Currency** (Lines 427-438): `<select>`, required (options: UZS, USD, EUR)
- **Due date** (Lines 439-445): `<input type="date">`, required
- **Account** (Lines 451-463): `<select>`, **optional**
- **Type** (Lines 468-489): Button group toggle, required (DEBT or RECEIVABLE)
- **Description** (Lines 494-501): `<textarea rows="3">`, optional

#### Validation Logic
**Lines 124-128:**
```typescript
if (!form.personName || !form.amount) {
  toast.error('Please fill person and amount')
  return
}
```

**Required Fields:**
- personName
- amount
- currency (defaults to 'UZS')
- dueDate (defaults to today)
- type (defaults to 'DEBT')

**Optional Fields:**
- description
- accountId

#### POST Body
**Lines 129-138:**
```typescript
await debtsApi.create({
  personName: form.personName,
  amount: Number(form.amount),
  currency: form.currency as 'USD' | 'EUR' | 'UZS',
  dueDate: form.dueDate,
  type: form.type,
  description: form.description,
  accountId: form.accountId || undefined,
})
```

#### Repayment Modal
**Lines 539-573:**
```typescript
<Modal open={!!repayModal} onClose={() => setRepayModal(null)} title="Record repayment">
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div>
      <label>Amount</label>
      <input type="number" value={repayModal?.amount || ''} min="0" step="any" />
    </div>
    <div>
      <label>Account (optional)</label>
      <select value={repayModal?.accountId || ''}>
        {/* account options */}
      </select>
    </div>
```

**Repayment POST Body:**
```typescript
await debtsApi.repay(repayModal.id, {
  paymentAmount: Number(repayModal.amount),
  accountId: repayModal.accountId || undefined,
})
```

#### Status Badge
**Lines 231-263:** Dynamic status rendering:
- `CLOSED` → Green "Closed" badge
- `OPEN` → Blue pulsing badge

#### Due Date Badge
**Lines 217-229:** Shows days remaining or overdue:
- Positive days: "Xd left"
- Negative days: "Xd overdue" (in red)

---

## 5. BUDGET FORM

### File: [src/pages/Budget.tsx](src/pages/Budget.tsx)

### 5a. MONTHLY BUDGET MODAL

#### State Variables
**Lines 30-38:**
```typescript
const [goalInput, setGoalInput] = useState('')
const [goalCurrency, setGoalCurrency] = useState<(typeof CURRENCIES)[number]>('UZS')
```

#### Form Fields
**Lines 431-459:** "Set monthly budget" modal:
- **Monthly budget** (Lines 436-442): `<input type="number">`, required
- **Currency** (Lines 443-451): `<select>`, required (UZS, USD, EUR)

#### Validation Logic
**Lines 118-123:**
```typescript
const parsed = Number(goalInput || incomeGoal)
if (!parsed || parsed <= 0) {
  toast.error('Enter a valid budget amount')
  return
}
```

**Required Fields:**
- monthlyLimit (must be > 0)
- currency (defaults to 'UZS')

#### POST Body
**Lines 133-140:**
```typescript
await budgetApi.set({
  monthlyLimit: parsed,
  type: 'MONTHLY',
  currency: goalCurrency,
  year: currentYear,
  month: currentMonth,
})
```

### 5b. CATEGORY BUDGET MODAL

#### State Variables
**Lines 33-36:**
```typescript
const [selectedCategory, setSelectedCategory] = useState<string>('')
const [categoryLimit, setCategoryLimit] = useState('')
const [categoryCurrency, setCategoryCurrency] = useState<(typeof CURRENCIES)[number]>('UZS')
```

#### Form Fields
**Lines 461-530:** "Add category limit" modal:
- **Category** (Lines 466-476): `<select>`, required, populated from expense categories
- **Monthly limit** (Lines 481-492): `<input type="number">`, required (min="1")
- **Currency** (Lines 497-505): `<select>`, required (UZS, USD, EUR)

#### Validation Logic
**Lines 145-155:**
```typescript
if (!selectedCategory) {
  toast.error('Please select a category')
  return
}
const parsed = Number(categoryLimit)
if (!parsed || parsed <= 0) {
  toast.error('Limit must be positive')
  return
}
```

**Required Fields:**
- categoryId (must be selected)
- monthlyLimit (must be > 0)
- currency (defaults to 'UZS')

**Optional Fields:**
- None

#### POST Body
**Lines 162-169:**
```typescript
await budgetApi.setCategory({
  categoryId: selectedCategory,
  monthlyLimit: parsed,
  type: 'MONTHLY',
  currency: categoryCurrency,
  year: currentYear,
  month: currentMonth,
})
```

#### Submit Button State
**Lines 514-522:** Button is disabled when:
- `!selectedCategory || !categoryLimit`

---

## 6. MODAL COMPONENT

### File: [src/components/ui/Modal.tsx](src/components/ui/Modal.tsx)

Used consistently across all forms with:
- `open` - boolean prop to control visibility
- `onClose` - callback when modal is closed
- `title` - modal header text
- `subtitle` - optional subtitle text (used in Expenses and Debts)

---

## KEY OBSERVATIONS

### Consistent Patterns
1. **Date Fields**: Always use ISO format `YYYY-MM-DD` with `type="date"`
2. **Number Fields**: Use `type="number"` with `min="0"` and `step="any"`
3. **Currency Selection**: Default to 'UZS', options from CURRENCIES constant
4. **Grid Layout**: Most forms use 2-column grid for field pairs
5. **Validation**: Checked in handleSubmit before API call
6. **Toast Notifications**: Success/error feedback after each action

### Currency Auto-Selection
- **Expenses**: Currency auto-selects from account, disabled field if account chosen
- **Income**: Same as Expenses
- **Debts**: Manual currency selection required
- **Transfers**: Uses exchange rate for conversion if currencies differ
- **Budget**: Manual currency selection for goals and categories

### Date Defaults
- All date fields default to today (`format(new Date(), 'yyyy-MM-dd')`)
- Budget modals use current year/month from system date

### Special Validations
- **Transfers**: fromAccountId must differ from toAccountId
- **Debts**: personName is required (no account required)
- **Budget Categories**: Must select category AND enter valid limit

### POST Body Patterns
- All amounts converted to `Number()`
- All optional fields checked with `|| undefined` pattern
- All POST bodies include timestamps/metadata server-side

### State Reset After Submit
All forms reset to initial state after successful POST:
- Amount/values cleared
- Date reset to today
- Dropdowns reset to empty or default
- Modal closes automatically

---

## CURRENCIES CONSTANT

Used across all forms:
```typescript
CURRENCIES = ['UZS', 'USD', 'EUR']
```

---

## FORM SUBMIT PATTERN

All forms follow same async pattern:
```typescript
const handleSubmit = () => {
  setTimeout(async () => {
    // 1. Validation check
    // 2. API call (create, update, repay, etc)
    // 3. Success toast
    // 4. Modal close
    // 5. Form reset
    // 6. Data refresh (loadExpenses, refreshAccounts, etc)
  }, 0)
}
```

The `setTimeout(..., 0)` ensures non-blocking execution.
