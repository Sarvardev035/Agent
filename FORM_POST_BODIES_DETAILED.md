# Form POST Bodies with Line Numbers

## Exact Code Locations for All Form Submission Logic

---

## 1. EXPENSES - POST BODY

**File:** `src/pages/Expenses.tsx`  
**Lines 127-156:**

### Validation Check
```typescript
// Line 127-132: Validation
const handleSubmit = () => {
  setTimeout(async () => {
    if (!formData.amount || !formData.expenseDate || !formData.accountId || !formData.categoryId) {
      toast.error('Please fill amount, date, category, account, and currency')
      return
    }
```

### API Call
```typescript
// Line 133-142: POST Body
try {
  await expensesApi.create({
    amount: Number(formData.amount),
    expenseDate: formData.expenseDate,
    description: formData.description,
    categoryId: formData.categoryId,
    accountId: formData.accountId,
    currency: formData.currency,
  })
  toast.success('Expense added')
```

### Form Reset
```typescript
// Line 147-155: Reset to initial state
setFormData({
  amount: '',
  expenseDate: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  categoryId: '',
  accountId: '',
  currency: 'UZS',
})
```

### Modal Form Fields
```typescript
// Lines 370-429: Form inputs in modal
<Modal open={showModal} onClose={() => setShowModal(false)} title="Add expense">
  {/* Amount field */}          // Line 376
  <input type="number" value={formData.amount} />
  
  {/* Date field */}             // Line 383
  <input type="date" value={formData.expenseDate} />
  
  {/* Category field */}         // Line 392
  <select value={formData.categoryId}>
    {categoryOptions.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
  </select>
  
  {/* Currency field */}         // Line 401
  <select value={formData.currency} disabled={!!formData.accountId}>
    {CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
  </select>
  
  {/* Account field */}          // Line 425
  <select value={formData.accountId}>
    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
  </select>
  
  {/* Description field */}      // Line 437
  <input value={formData.description} placeholder="Optional" />
</Modal>
```

---

## 2. INCOME - POST BODY

**File:** `src/pages/Income.tsx`  
**Lines 127-156:** (Identical structure to Expenses)

### Validation Check
```typescript
// Line 127-132: Validation
if (!formData.amount || !formData.incomeDate || !formData.accountId || !formData.categoryId) {
  toast.error('Please fill amount, date, account, category, and currency')
  return
}
```

### API Call
```typescript
// Line 133-142: POST Body
await incomeApi.create({
  amount: Number(formData.amount),
  incomeDate: formData.incomeDate,
  description: formData.description,
  categoryId: formData.categoryId,
  accountId: formData.accountId,
  currency: formData.currency,
})
```

### Key Difference from Expenses
**Line 383:** Uses `formData.incomeDate` instead of `formData.expenseDate`
```typescript
<input type="date" value={formData.incomeDate} onChange={e => handleChange('incomeDate', e.target.value)} />
```

---

## 3. TRANSFERS - POST BODY

**File:** `src/pages/Transfers.tsx`  
**Lines 52-82:**

### Validation Checks
```typescript
// Lines 52-63: Two-part validation
const handleSubmit = async () => {
  if (!form.amount || !form.fromAccountId || !form.toAccountId) {
    toast.error('Fill all required fields')
    return
  }
  if (form.fromAccountId === form.toAccountId) {
    toast.error('Choose different accounts')
    return
  }
```

### API Call
```typescript
// Line 65-72: POST Body
setTimeout(async () => {
  try {
    await transfersApi.create({
      amount: Number(form.amount),
      fromAccountId: form.fromAccountId,
      toAccountId: form.toAccountId,
      description: form.description,
      transferDate: form.transferDate,
      exchangeRate: Number(form.exchangeRate) || 1,
    })
    toast.success('Transfer created')
```

### Form Reset
```typescript
// Line 73-80: Reset form
setForm({
  amount: '',
  fromAccountId: '',
  toAccountId: '',
  description: '',
  transferDate: format(new Date(), 'yyyy-MM-dd'),
  exchangeRate: '1',
})
```

### Modal Form Fields
```typescript
// Lines 170-241: Form inputs
<Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create transfer">
  {/* From account */}           // Line 176
  <select value={form.fromAccountId}>
    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
  </select>
  
  {/* To account */}             // Line 188
  <select value={form.toAccountId}>
    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
  </select>
  
  {/* Amount */}                 // Line 204
  <input type="number" value={form.amount} placeholder="0.00" step="any" />
  
  {/* Date */}                   // Line 214
  <input type="date" value={form.transferDate} />
  
  {/* Exchange rate */}          // Line 226
  <input type="number" value={form.exchangeRate} step="any" />
  
  {/* Description */}            // Line 237
  <input value={form.description} placeholder="Optional" />
</Modal>
```

### Currency Conversion Logic
```typescript
// Lines 49-51: Detect and calculate conversion
const currenciesDiffer = !!(fromAccount?.currency && toAccount?.currency && fromAccount.currency !== toAccount.currency)
const convertedAmount = useMemo(() => {
  const amt = Number(form.amount)
  const rate = Number(form.exchangeRate) || 1
  return currenciesDiffer ? amt * rate : amt
}, [currenciesDiffer, form.amount, form.exchangeRate])
```

---

## 4. DEBTS - POST BODY

**File:** `src/pages/Debts.tsx`  
**Lines 124-140 (create), Lines 172-184 (repay), Lines 189-196 (delete):**

### Create Debt - Validation
```typescript
// Lines 124-128: Validation
const handleSubmit = () => {
  setTimeout(async () => {
    if (!form.personName || !form.amount) {
      toast.error('Please fill person and amount')
      return
    }
```

### Create Debt - API Call
```typescript
// Lines 129-138: POST Body
try {
  await debtsApi.create({
    personName: form.personName,
    amount: Number(form.amount),
    currency: form.currency as 'USD' | 'EUR' | 'UZS',
    dueDate: form.dueDate,
    type: form.type,
    description: form.description,
    accountId: form.accountId || undefined,
  })
  toast.success('Debt saved')
```

### Create Debt - Form Reset
```typescript
// Lines 142-143: Partial reset (only amount & description)
setForm(prev => ({ ...prev, amount: '', description: '' }))
```

### Create Debt - Modal Form Fields
```typescript
// Lines 408-501: All form inputs
<Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add debt">
  {/* Person name */}            // Line 408
  <input value={form.personName} placeholder="Name" />
  
  {/* Amount */}                 // Line 414
  <input type="number" value={form.amount} placeholder="0.00" step="any" />
  
  {/* Currency */}               // Line 427
  <select value={form.currency}>
    {CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
  </select>
  
  {/* Due date */}               // Line 439
  <input type="date" value={form.dueDate} />
  
  {/* Account (optional) */}     // Line 451
  <select value={form.accountId}>
    <option value="">Select account</option>
    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
  </select>
  
  {/* Type (DEBT/RECEIVABLE) */ // Line 468
  <div>
    {['DEBT', 'RECEIVABLE'].map(type => (
      <button key={type} onClick={() => setForm(prev => ({ ...prev, type: type as DebtType }))}>
        {type === 'DEBT' ? 'I owe (Debt)' : 'Owed to me (Receivable)'}
      </button>
    ))}
  </div>
  
  {/* Description (optional) */} // Line 494
  <textarea value={form.description} rows={3} placeholder="Optional details" />
</Modal>
```

### Record Repayment - Validation
```typescript
// Lines 177-181: Validation
const handleRepay = async () => {
  if (!repayModal) return
  const paymentAmount = Number(repayModal.amount)
  if (!paymentAmount) {
    toast.error('Enter repayment amount')
    return
  }
```

### Record Repayment - API Call
```typescript
// Lines 182-184: POST Body
try {
  await debtsApi.repay(repayModal.id, {
    paymentAmount,
    accountId: repayModal.accountId || undefined,
  })
```

### Record Repayment - Modal Fields
```typescript
// Lines 545-573: Repay modal inputs
<Modal open={!!repayModal} onClose={() => setRepayModal(null)} title="Record repayment">
  {/* Amount */}                 // Line 549
  <input type="number" value={repayModal?.amount || ''} min="0" step="any" />
  
  {/* Account (optional) */}     // Line 558
  <select value={repayModal?.accountId || ''}>
    <option value="">Select account</option>
    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
  </select>
</Modal>
```

### Delete Debt
```typescript
// Lines 190-196: Delete handler
const handleDelete = async () => {
  if (!confirmId) return
  try {
    await debtsApi.delete(confirmId)
    toast.success('Debt removed')
```

---

## 5. BUDGET - POST BODIES

**File:** `src/pages/Budget.tsx`

### Set Monthly Goal - Validation
```typescript
// Lines 118-123: Validation
const handleSaveGoal = async () => {
  const parsed = Number(goalInput || incomeGoal)
  if (!parsed || parsed <= 0) {
    toast.error('Enter a valid budget amount')
    return
  }
```

### Set Monthly Goal - API Call
```typescript
// Lines 124-140: POST Body
setTimeout(async () => {
  try {
    await budgetApi.set({
      monthlyLimit: parsed,
      type: 'MONTHLY',
      currency: goalCurrency,
      year: currentYear,
      month: currentMonth,
    })
    toast.success('Monthly budget saved')
    setGoalModal(false)
    setIncomeGoal(parsed)
```

### Set Monthly Goal - Modal Fields
```typescript
// Lines 431-459: Form inputs
<Modal open={goalModal} onClose={() => setGoalModal(false)} title="Set monthly budget">
  {/* Monthly budget amount */}  // Line 436
  <input type="number" value={goalInput || incomeGoal || ''} placeholder="0.00" />
  
  {/* Currency */}               // Line 443
  <select value={goalCurrency}>
    <option value="UZS">🇺🇿 UZS</option>
    <option value="USD">🇺🇸 USD</option>
    <option value="EUR">🇪🇺 EUR</option>
  </select>
</Modal>
```

### Set Category Limit - Validation
```typescript
// Lines 145-155: Validation
const handleSaveCategory = async () => {
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

### Set Category Limit - API Call
```typescript
// Lines 156-169: POST Body
setTimeout(async () => {
  try {
    await budgetApi.setCategory({
      categoryId: selectedCategory,
      monthlyLimit: parsed,
      type: 'MONTHLY',
      currency: categoryCurrency,
      year: currentYear,
      month: currentMonth,
    })
    toast.success('Category limit saved')
    setCategoryModal(false)
```

### Set Category Limit - Modal Fields
```typescript
// Lines 461-530: Form inputs
<Modal open={categoryModal} onClose={() => setCategoryModal(false)} title="Add category limit">
  {/* Category */}               // Line 466
  <select value={selectedCategory} required>
    <option value="">Select a category</option>
    {categoryOptions.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
  </select>
  
  {/* Monthly limit */}          // Line 481
  <input type="number" value={categoryLimit} placeholder="e.g. 500000" min="1" step="any" required />
  
  {/* Currency */}               // Line 497
  <select value={categoryCurrency} required>
    <option value="UZS">🇺🇿 UZS</option>
    <option value="USD">🇺🇸 USD</option>
    <option value="EUR">🇪🇺 EUR</option>
  </select>
</Modal>
```

### Category Limit Button State
```typescript
// Lines 514-522: Submit button disabled state
<button
  onClick={handleSaveCategory}
  disabled={!selectedCategory || !categoryLimit}
  style={{
    background: (!selectedCategory || !categoryLimit) ? '#cbd5e1' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
    cursor: (!selectedCategory || !categoryLimit) ? 'not-allowed' : 'pointer',
  }}
>
  Save category limit
</button>
```

---

## Summary Table by File

| Action | File | Validation | POST Body | Reset |
|--------|------|-----------|-----------|-------|
| Add Expense | Expenses.tsx | Line 127-132 | Line 133-142 | Line 147-155 |
| Add Income | Income.tsx | Line 127-132 | Line 133-142 | Line 147-155 |
| Create Transfer | Transfers.tsx | Line 52-63 | Line 65-72 | Line 73-80 |
| Add Debt | Debts.tsx | Line 124-128 | Line 129-138 | Line 142-143 |
| Repay Debt | Debts.tsx | Line 177-181 | Line 182-184 | Auto close |
| Delete Debt | Debts.tsx | — | Line 190-196 | Auto refresh |
| Set Monthly Budget | Budget.tsx | Line 118-123 | Line 124-140 | Auto close |
| Set Category Limit | Budget.tsx | Line 145-155 | Line 156-169 | Line 170-173 |

---

## All Required vs Optional Fields by Form

### EXPENSES (Required: amount, expenseDate, categoryId, accountId, currency)
- ✓ amount
- ✓ expenseDate
- ✓ categoryId
- ✓ accountId
- ✓ currency (defaults to 'UZS' or account currency)
- ✗ description

### INCOME (Required: amount, incomeDate, categoryId, accountId, currency)
- ✓ amount
- ✓ incomeDate
- ✓ categoryId
- ✓ accountId
- ✓ currency (defaults to 'UZS' or account currency)
- ✗ description

### TRANSFERS (Required: amount, fromAccountId, toAccountId, transferDate)
- ✓ amount
- ✓ fromAccountId (must ≠ toAccountId)
- ✓ toAccountId (must ≠ fromAccountId)
- ✓ transferDate (defaults to today)
- ✗ exchangeRate (defaults to 1)
- ✗ description

### DEBTS (Required: personName, amount, currency, dueDate, type)
- ✓ personName
- ✓ amount
- ✓ currency (defaults to 'UZS')
- ✓ dueDate (defaults to today)
- ✓ type (defaults to 'DEBT')
- ✗ accountId
- ✗ description

### DEBTS REPAY (Required: paymentAmount)
- ✓ paymentAmount
- ✗ accountId

### BUDGET MONTHLY (Required: monthlyLimit, currency)
- ✓ monthlyLimit (must > 0)
- ✓ currency (defaults to 'UZS')

### BUDGET CATEGORY (Required: categoryId, monthlyLimit, currency)
- ✓ categoryId (must select)
- ✓ monthlyLimit (must > 0)
- ✓ currency (defaults to 'UZS')
