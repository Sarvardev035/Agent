# 💰 Finly — Personal Finance Web App

A **security-first** personal finance management application built with React 18, TypeScript, Vite, and Tailwind CSS.

## ✨ Features

- **🔐 Secure Authentication** — Token-based auth with expiry validation
- **💳 Account Management** — Track multiple accounts (Card, Cash, Bank)
- **📊 Expenses & Income** — Categorized tracking with smart date grouping
- **🔄 Real-time Currency Exchange** — Convert any currency using live rates
- **💱 Smart Transfers** — Between accounts with automatic exchange rates
- **💳 Debt Tracking** — Track money lent/borrowed with due dates
- **💰 Budget Management** — Set and monitor spending limits by category
- **📈 Statistics** — Charts and analytics with period filtering
- **📅 Calendar View** — Month-view expense/income visualization
- **🛡️ XSS Prevention** — All user text sanitized with DOMPurify
- **📝 Input Validation** — All forms validated with Zod schemas
- **⚡ Rate Limiting** — Client-side protection against brute-force attacks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (16+ with adjustments)
- npm or yarn

### Installation

```bash
# Clone or navigate to project
cd finly

# Install dependencies
npm install

# Create .env.local (copy from .env.example)
cp .env.example .env.local

# Add your API key for currency exchange
# Get free key at https://www.exchangerate-api.com
```

### Development

```bash
npm run dev
# Starts dev server at http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── security.ts      # Token storage, Zod schemas, rate limiting
│   ├── api.ts           # Axios instance with interceptors
│   ├── currency.ts      # Real-time exchange rates
│   └── helpers.ts       # Utilities (formatCurrency, category metadata)
├── services/
│   ├── auth.service.ts
│   ├── accounts.service.ts
│   ├── expenses.service.ts
│   ├── income.service.ts
│   ├── transfers.service.ts
│   ├── debts.service.ts
│   ├── budget.service.ts
│   └── stats.service.ts
├── store/
│   ├── auth.store.ts    # Zustand auth state
│   ├── finance.store.ts # Zustand finance state
│   └── currency.store.ts# Real-time exchange rates cache
├── components/
│   ├── guards/
│   │   └── ProtectedRoute.tsx   # Route protection
│   └── Layout/
│       └── AppShell.tsx         # Main layout with sidebar
├── pages/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Dashboard.tsx
│   ├── Expenses.tsx
│   ├── Income.tsx
│   ├── Transfers.tsx
│   ├── Debts.tsx
│   ├── Budget.tsx
│   ├── Statistics.tsx
│   └── CalendarView.tsx
├── App.tsx              # Main router
├── main.tsx             # Entry point
└── index.css            # Global styles + CSS variables
```

## 🔐 Security Architecture

### Token Storage
- JWT tokens stored in localStorage with expiry checking
- Automatic cleanup on expiration
- Malformed tokens rejected

### Input Validation
- All forms validated with **Zod** schemas before submission
- Type-safe form data with TypeScript inference
- Automatic field transformation (trim, sanitize, lowercase)

### XSS Prevention
- User-generated text sanitized with **DOMPurify**
- No `dangerouslySetInnerHTML` anywhere
- All category names & descriptions cleaned

### Request Security
- CSRF protection header (`X-Requested-With`)
- HTTPS enforcement in production
- Automatic session refresh with 401 responses

### Rate Limiting
- Login attempts limited to 5 per 15 minutes
- Client-side enforcement (server-side required too)

## 💱 Currency Exchange

### Features
- Real-time rates from **ExchangeRate-API**
- Automatic caching (1 hour) to reduce API calls
- Fallback hardcoded rates if API fails
- Support for: USD, EUR, UZS

### How It Works

```tsx
import { useCurrencyStore } from '@/store/currency.store'

// Get exchange rate
const rate = await useCurrencyStore.getState().getRate('USD', 'EUR')

// Convert amount
const converted = await useCurrencyStore.getState().convert(100, 'USD', 'EUR')
```

### Setup

1. Get free API key: https://www.exchangerate-api.com
2. Add to `.env.local`:
   ```
   VITE_EXCHANGE_API_KEY=your_key_here
   ```
3. Rates are cached locally to reduce API usage

## 📚 API Endpoints

All requests automatically include JWT token via interceptor.

```
Authentication:
  POST /auth/login        # { email, password }
  POST /auth/register     # { name, email, password }
  POST /auth/logout

Accounts:
  GET  /api/accounts
  POST /api/accounts      # { name, type, currency, balance }
  PUT  /api/accounts/:id
  DELETE /api/accounts/:id

Expenses:
  GET  /api/expenses      # ?startDate=2024-01-01&endDate=2024-12-31
  POST /api/expenses      # { amount, expenseDate, categoryId, currency, accountId, description? }
  PUT  /api/expenses/:id
  DELETE /api/expenses/:id

Income:
  GET  /api/incomes
  POST /api/incomes       # { amount, incomeDate, categoryId, currency, accountId, description? }
  PUT  /api/incomes/:id
  DELETE /api/incomes/:id

Transfers:
  GET  /api/transfers
  POST /api/transfers     # { fromAccountId, toAccountId, amount, transferDate, exchangeRate, description? }

Debts:
  GET  /api/debts
  POST /api/debts         # { personName, amount, currency, dueDate, type, accountId? }
  POST /api/debts/:id/repay # { paymentAmount, accountId? }
  DELETE /api/debts/:id

Budget:
  GET  /api/budgets
  POST /api/budgets          # { monthlyLimit, year, month }
  POST /api/budgets/categories # { monthlyLimit, categoryId, type: 'MONTHLY', year, month }

Analytics:
  GET  /api/analytics/summary
  GET  /api/analytics/monthly-expenses
  GET  /api/analytics/expenses-by-category
  GET  /api/analytics/income-vs-expense
```

## 🎨 Customization

### Colors & Design
- CSS variables in `src/index.css`
- Modify `--blue`, `--green`, `--red` for brand colors
- Tailwind alternative: can be added later

### Categories
- Edit `CATEGORY_META` in `src/lib/helpers.ts`
- Add emoji, colors, labels for each category

### Supported Currencies
- Modify `supportedCurrencies` in `src/lib/currency.ts`
- Update `ExpenseSchema.category` in `src/lib/security.ts`

## 🚀 Deployment

### Environment Variables
- `VITE_EXCHANGE_API_KEY` — ExchangeRate API key
- `VITE_API_URL` — Backend API base URL (optional)

### Build & Deploy

```bash
# Build for production
npm run build

# Output in ./dist/ directory
# Deploy to Netlify, Vercel, or any static host

# For Vercel:
vercel

# For Netlify:
netlify deploy --prod --dir=dist
```

### Recommended Hosts
- **Vercel** — Zero-config deployment, serverless
- **Netlify** — Excellent DX, auto-deployments from Git
- **AWS S3 + CloudFront** — Cost-effective for static sites
- **GitHub Pages** — Free, works great with base path config

## 📦 Dependencies

### Core
- `react` (18) — UI framework
- `react-router-dom` (6) — Client-side routing
- `typescript` — Type safety

### Security & Validation
- `zod` — Schema validation
- `dompurify` — XSS prevention

### State & Data
- `zustand` — Lightweight state management
- `axios` — HTTP client with interceptors

### UI & Animation
- `framer-motion` — Smooth animations
- `lucide-react` — Icon library
- `react-hot-toast` — Notification toasts
- `recharts` — Chart library
- `react-countup` — Number animations

### Utilities
- `date-fns` — Date formatting
- `clsx` — CSS classname utilities
- `tailwind-merge` — Tailwind CSS merging

## 🧪 Testing

Add tests later with:
- `vitest` — Unit tests
- `@testing-library/react` — Component tests
- `@testing-library/user-event` — User interaction testing

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```

## 📝 TypeScript Configuration

- **Strict mode** enabled (`"strict": true`)
- **No implicit any** types
- **Strict null checks**
- **Module resolution**: `bundler` (for Vite)
- **JSX**: `react-jsx` (no `React` import needed)

## 🐛 Common Issues

### Currency rates not fetching
- Check `.env.local` has valid API key
- Clear localStorage cache: `localStorage.clear()`
- Check CORS settings if using direct API

### Login not working
- Verify backend is running at configured URL
- Check network tab in DevTools for actual error
- Rate limiter might be active (wait 15 mins or clear localStorage)

### Build fails on older Node
- Upgrade to Node 18+ or use `nvm use 18`
- Or downgrade Vite/React if needed

## 📄 License

Private project — Finly

## 📞 Support

For issues or questions:
1. Check the security guidelines above
2. Review error messages in console/network tab
3. Verify `.env.local` is properly configured
4. Test API connectivity separately

---

**Built with security first.** Every request validated, every input sanitized.
