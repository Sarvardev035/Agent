import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Zap, Loader2, AlertTriangle } from 'lucide-react'
import api from '../../lib/api'
import {
  LoginSchema,
  loginRateLimiter,
} from '../../lib/security'

export default function Login() {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!loginRateLimiter.canProceed()) {
      const ms = loginRateLimiter.getRemainingMs()
      const mins = Math.ceil(ms / 60000)
      setError(`Too many attempts. Try again in ${mins} minute(s).`)
      return
    }

    const result = LoginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    try {
      setIsLoading(true)
      const { data } = await api.post('/api/auth/login', {
        email: result.data.email,
        password: result.data.password,
      })

      const tokenData = data?.data ?? data
      const accessToken = tokenData?.accessToken ?? tokenData?.data?.accessToken
      const refreshToken = tokenData?.refreshToken ?? tokenData?.data?.refreshToken

      if (!accessToken) throw new Error('No token received')

      localStorage.setItem('finly_access_token', accessToken)
      localStorage.setItem('finly_refresh_token', refreshToken || '')
      toast.success('Welcome back!')
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      // Show exact error message from API (includes URL and CORS hints)
      if (msg.includes('401') || msg.includes('credentials')) {
        setError('Incorrect email or password.')
      } else {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }, [email, password, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #0f2040 40%, #1a1a2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{
          position: 'absolute', top: -100, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{
          position: 'absolute', bottom: -150, left: -100,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          background: 'rgba(255,255,255,0.98)',
          borderRadius: 24,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            }}
          >
            <Zap size={26} color="white" fill="white" />
          </motion.div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: '#0a1628',
            margin: '0 0 6px', letterSpacing: '-0.02em',
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Sign in to your Finly account
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate autoComplete="on">
          {/* Email field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
              color: '#374151', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              maxLength={255}
              style={{
                width: '100%', height: 46,
                padding: '0 14px',
                border: '1.5px solid #e2e8f0', borderRadius: 10,
                fontSize: 14, color: '#0f172a',
                background: '#f8fafc', outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#2563eb'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                e.currentTarget.style.background = '#fff'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = '#f8fafc'
              }}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
              color: '#374151', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                maxLength={128}
                style={{
                  width: '100%', height: 46,
                  padding: '0 44px 0 14px',
                  border: '1.5px solid #e2e8f0', borderRadius: 10,
                  fontSize: 14, color: '#0f172a',
                  background: '#f8fafc', outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                  e.currentTarget.style.background = '#fff'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.background = '#f8fafc'
                }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#94a3b8', padding: 4,
                  display: 'flex', alignItems: 'center',
                }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1,  y: 0 }}
              style={{
                background: '#fff1f2', border: '1px solid #fecdd3',
                borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: '#be123c',
                display: 'flex', alignItems: 'flex-start', gap: 8,
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            style={{
              width: '100%', height: 48,
              background: (isLoading || !email || !password)
                ? '#bfdbfe'
                : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: '#ffffff', border: 'none',
              borderRadius: 12, fontSize: 15, fontWeight: 600,
              cursor: (isLoading || !email || !password) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
              boxShadow: (isLoading || !email || !password)
                ? 'none'
                : '0 4px 16px rgba(37,99,235,0.4)',
              letterSpacing: '0.01em',
            }}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 size={18} />
                </motion.div>
                Signing in...
              </>
            ) : 'Sign In →'}
          </button>

          {/* Terms */}
          <p style={{
            fontSize: 11, color: '#94a3b8', textAlign: 'center',
            marginTop: 14, lineHeight: 1.6,
          }}>
            By signing in you agree to our{' '}
            <Link to="/terms" style={{ color: '#2563eb', textDecoration: 'none' }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" style={{ color: '#2563eb', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
          </p>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: '#ccc' }}>
            Backend: https://finly.uyqidir.uz
          </div>
        </form>

        <div style={{
          borderTop: '1px solid #f1f5f9', marginTop: 20, paddingTop: 20,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 600,
              textDecoration: 'none' }}>
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
