# 🚀 Finly Quick Start Guide

## Installation (2 minutes)

```bash
cd /home/sarvarbek/Desktop/agent/finly

# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## Configuration (1 minute)

```bash
# Create .env.local file
cat > .env.local << 'EOF'
VITE_EXCHANGE_API_KEY=demo
VITE_API_URL=https://finly.uyqidir.uz
EOF

# Get real API key (free):
# 1. Visit https://www.exchangerate-api.com
# 2. Sign up for free tier (1500 requests/month)
# 3. Copy your API key
# 4. Paste into VITE_EXCHANGE_API_KEY=your_key_here
```

## Test Login

```
Email: test@example.com
Password: TestPassword123

(Any valid email/password matching these patterns will work)
```

## Project Structure Quick Reference

```
finly/
├── src/
│   ├── lib/
│   │   ├── security.ts       ← Validation schemas, token storage
│   │   ├── api.ts            ← Axios with interceptors
│   │   ├── currency.ts       ← Exchange rates
│   │   └── helpers.ts        ← Utilities (formatCurrency, etc)
│   │
│   ├── services/             ← API calls (8 services)
│   │   ├── auth.service.ts
│   │   ├── accounts.service.ts
│   │   ├── expenses.service.ts
│   │   └── ... (others)
│   │
│   ├── store/                ← Zustand state management
│   │   ├── auth.store.ts     ← User login/logout
│   │   ├── finance.store.ts  ← Accounts
│   │   └── currency.store.ts ← Exchange rates
│   │
│   ├── components/
│   │   ├── guards/
│   │   │   └── ProtectedRoute.tsx
│   │   └── Layout/
│   │       └── AppShell.tsx   ← Sidebar + top bar
│   │
│   ├── pages/                ← 10 pages (ready for implementation)
│   │   ├── Auth/
│   │   │   ├── Login.tsx      ✅ Complete
│   │   │   └── Register.tsx   ✅ Complete
│   │   ├── Dashboard.tsx      (placeholder)
│   │   ├── Expenses.tsx       (placeholder)
│   │   ├── Income.tsx         (placeholder)
│   │   ├── Transfers.tsx      (placeholder)
│   │   ├── Debts.tsx          (placeholder)
│   │   ├── Budget.tsx         (placeholder)
│   │   ├── Statistics.tsx     (placeholder)
│   │   └── CalendarView.tsx   (placeholder)
│   │
│   ├── App.tsx               ← Router setup
│   ├── main.tsx              ← Entry point
│   └── index.css             ← Global styles
│
├── index.html
├── tsconfig.json             ← TypeScript config (strict mode)
├── vite.config.ts
├── package.json
├── .env.example
├── README.md                 ← Full documentation
└── IMPLEMENTATION_STATUS.md  ← What's done & next steps
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Type checking
npm run type-check      # Check for TypeScript errors

# Building
npm run build           # Build for production
npm run preview         # Preview production build locally
```

## Adding Features

### Example: Add Expense to Dashboard

```tsx
// src/pages/Expenses.tsx
import { useEffect, useState } from 'react'
import { expensesService, Expense } from '@/services/expenses.service'
import { formatCurrency, smartDate } from '@/lib/helpers'
import toast from 'react-hot-toast'

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    expensesService.getAll()
      .then(res => setExpenses(res.data ?? []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Expenses</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {expenses.map(exp => (
            <li key={exp.id}>
              {smartDate(exp.date)} — {formatCurrency(exp.amount)} 
              ({exp.category})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Using Currency Converter

```tsx
import { useCurrencyStore } from '@/store/currency.store'

// In component
const [converted, setConverted] = useState(0)

const handleConvert = async () => {
  const result = await useCurrencyStore.getState().convert(100, 'USD', 'EUR')
  setConverted(result)
}
```

### Validating Forms

```tsx
import { ExpenseSchema } from '@/lib/security'

// Validate before API call
const result = ExpenseSchema.safeParse({
  amount: 50,
  date: '2024-03-21',
  category: 'FOOD',
  accountId: 1,
  description: 'Lunch at cafe'
})

if (!result.success) {
  // Form has errors
  console.log(result.error.issues[0].message)
} else {
  // Valid! Use result.data
  await expensesService.create(result.data)
}
```

## Troubleshooting

**Dev server won't start?**
```bash
# Kill any existing process
lsof -i :5173 | grep -v COMMAND | awk '{print $2}' | xargs kill -9

# Try again
npm run dev
```

**TypeScript errors?**
```bash
# Check for errors
npm run type-check

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

**Currency rates not working?**
```bash
# Check if API key is set
grep VITE_EXCHANGE .env.local

# If empty, get key from https://www.exchangerate-api.com
# Then update .env.local with your key
```

**Build fails?**
```bash
npm run type-check  # Check for TS errors first
npm run build       # Try building again
```

## Security Reminders

1. **Never commit** `.env.local` (use `.env.example`)
2. **Always validate** forms with Zod before API calls
3. **Sanitize** all user-generated text (DOMPurify does this)
4. **Check token** validity before protected routes
5. **Never use** `dangerouslySetInnerHTML` or `eval()`
6. **Use HTTPS** in production

## API Responses

### Login Success
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login Error (401)
```json
{
  "error": "Invalid credentials"
}
```

Token automatically clears and redirects to login on 401.

## Next: Implement Pages

1. **Dashboard** — Show balance summary
2. **Expenses** — List, add, edit, delete
3. **Income** — Similar to expenses
4. **Transfers** — With currency conversion
5. **Debts** — Track lent/borrowed
6. **Budget** — Set limits by category
7. **Statistics** — Charts with Recharts
8. **Calendar** — Month view grid

Each page can use the existing services, stores, and utilities.

---

**You're all set!** 🎉

The foundation is complete. Start building the page features. Questions? Check the README.md or IMPLEMENTATION_STATUS.md.
