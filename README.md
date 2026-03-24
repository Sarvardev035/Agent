# Finly

Personal finance and banking web app built with React, TypeScript, and Vite.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Main Features

- Account, income, and expense tracking
- Transfers, debts, budgets, and analytics
- Calendar and notes views
- Family sharing and user management flows

### Environment Variables
- `VITE_EXCHANGE_API_KEY` — ExchangeRate API key
- `VITE_API_URL` — Backend API base URL (optional)
- `VITE_API_BASE_URL` — Backend API base URL override (preferred when both exist)
- `VITE_USE_API_CREDENTIALS` — Set `true` for cookie-based auth/CORS credentials mode, `false` for Bearer token mode (default)

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
- For CORS/preflight failures, backend must allow your frontend origin and `Authorization` header
- If using cross-site cookies, set `VITE_USE_API_CREDENTIALS=true` and enable backend CORS credentials (`Access-Control-Allow-Credentials: true`) with explicit allowed origin

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
