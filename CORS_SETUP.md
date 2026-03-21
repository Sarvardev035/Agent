# CORS Configuration Guide

## Problem
Your frontend (`https://www.inteullpo.online`) is getting blocked by CORS when trying to call the backend (`https://finly.uyqidir.uz`).

Error in browser console:
```
Access to XMLHttpRequest at 'https://finly.uyqidir.uz/auth/login' from origin 'https://www.inteullpo.online' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution
Your **backend** needs to send CORS headers. The frontend is correctly configured.

### For Node.js/Express Backend

```javascript
const cors = require('cors');
const app = require('express')();

// Allow requests from your frontend domain
app.use(cors({
  origin: [
    'https://www.inteullpo.online',
    'https://inteullpo.online',
    'http://localhost:3000'  // for local testing
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Your routes here...
```

### For FastAPI/Python Backend

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.inteullpo.online",
        "https://inteullpo.online",
        "http://localhost:3000"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)
```

### For Django Backend

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "https://www.inteullpo.online",
    "https://inteullpo.online",
    "http://localhost:3000",
]

CORS_ALLOW_METHODS = [
    "GET", "POST", "PUT", "DELETE", "PATCH"
]

CORS_ALLOW_HEADERS = [
    "Content-Type", "Authorization", "X-Requested-With"
]
```

### For .NET/C# Backend

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy
            .WithOrigins("https://www.inteullpo.online", "https://inteullpo.online")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();
app.UseCors();
```

## Frontend Configuration

✅ **Already Correct** - No changes needed on frontend

The frontend (`src/lib/api.ts`) is properly configured:
- ✅ Correct headers: `X-Requested-With: XMLHttpRequest`
- ✅ Proper timeout handling
- ✅ JWT token injection
- ✅ Environment variable support for API URL

## Testing CORS

### 1. Check Backend Response Headers
Run this in your browser console:

```javascript
fetch('https://finly.uyqidir.uz/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'test@example.com', password: 'test' })
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', r.headers.get('Access-Control-Allow-Origin'));
})
```

### 2. Expected Response Headers
Your backend should return:
```
Access-Control-Allow-Origin: https://www.inteullpo.online
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Quick Checklist

- [ ] Backend server is running at `https://finly.uyqidir.uz`
- [ ] Backend has CORS middleware configured
- [ ] CORS allows origin: `https://www.inteullpo.online`
- [ ] CORS allows methods: GET, POST, PUT, DELETE, PATCH
- [ ] CORS allows headers: Content-Type, Authorization, X-Requested-With
- [ ] Test with `curl -H "Origin: https://www.inteullpo.online" ...`

## Troubleshooting

### Still Getting CORS Error?

1. **Verify backend is accessible:**
   ```bash
   curl -v https://finly.uyqidir.uz/auth/login
   ```
   Should get a response (not connection refused)

2. **Check if CORS middleware is installed:**
   - Express: `npm install cors`
   - FastAPI: Already built-in
   - Django: `pip install django-cors-headers`
   - .NET: Built-in, enable in Startup

3. **Verify allowed origins include your domain:**
   - Note: `inteullpo.online` ≠ `www.inteullpo.online` — configure both!

4. **Check origin in browser DevTools:**
   - Network tab → login request → Headers
   - Look for `Request Headers → Origin: https://www.inteullpo.online`

## Related Files

- `src/lib/api.ts` — Frontend API configuration
- `.env.example` — Environment variables
- Vercel deployment: `https://www.inteullpo.online`
- Backend API: `https://finly.uyqidir.uz`

## Questions?

After configuring CORS on your backend, the login page should work immediately. No frontend changes needed!
