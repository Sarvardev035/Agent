import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'
import { Eye, EyeOff, Zap, Loader2, AlertTriangle } from 'lucide-react'
import { RegisterSchema } from '../../lib/security'
import api from '../../lib/api'
import { TokenStorage } from '../../lib/security'

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {}

const extractToken = (value: unknown): string | null => {
  const root = asRecord(value)
  const nestedData = asRecord(root.data)
  const nestedResult = asRecord(root.result)
  const candidates = [
    root.token,
    root.accessToken,
    root.access_token,
    root.jwt,
    nestedData.token,
    nestedData.accessToken,
    nestedData.access_token,
    nestedData.jwt,
    nestedResult.token,
    nestedResult.accessToken,
    nestedResult.access_token,
    nestedResult.jwt,
  ]
  const found = candidates.find((v): v is string => typeof v === 'string' && v.length > 0)
  return found ?? null
}

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    setPasswordStrength(strength)
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = RegisterSchema.safeParse({ fullName, email, password })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/register', {
        fullName: result.data.fullName,
        email: result.data.email,
        password: result.data.password,
      })
      const root = asRecord(data)
      const inner = asRecord(root.data)
      const accessToken = (inner.accessToken || root.accessToken) as string | undefined
      const refreshToken = (inner.refreshToken || root.refreshToken) as string | undefined
      if (accessToken) TokenStorage.set(accessToken)
      if (refreshToken) localStorage.setItem('finly_refresh_token', refreshToken)
      
      localStorage.setItem('finly_user_name', result.data.fullName)
      localStorage.setItem('finly_user_email', result.data.email)
      
      toast.success('Account created! Welcome to Finly.')
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as AxiosError
      const status = axiosErr.response?.status

      if (status === 400) {
        const payload = asRecord(axiosErr.response?.data)
        const apiMessage =
          (typeof payload.message === 'string' && payload.message) ||
          (typeof payload.error === 'string' && payload.error) ||
          'Invalid registration data.'
        setError(apiMessage)
      } else if (status === 409) {
        setError('Email already registered')
      } else if (status === 404) {
        setError('Connection error: API endpoint not found.')
      } else {
        const msg = err instanceof Error ? err.message : 'Registration failed'
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [fullName, email, password, navigate])

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
            Create account
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Join Finly and manage your finances smarter
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
              color: '#374151', marginBottom: 6 }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              maxLength={100}
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
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
              color: '#374151', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  checkPasswordStrength(e.target.value)
                }}
                placeholder="At least 8 characters"
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

            {/* Password strength */}
            {password && (
              <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i < passwordStrength ? '#22c55e' : '#e2e8f0',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            )}
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
            disabled={loading || !fullName || !email || !password}
            style={{
              width: '100%', height: 48,
              background: (loading || !fullName || !email || !password)
                ? '#bfdbfe'
                : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: '#ffffff', border: 'none',
              borderRadius: 12, fontSize: 15, fontWeight: 600,
              cursor: (loading || !fullName || !email || !password) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
              boxShadow: (loading || !fullName || !email || !password)
                ? 'none'
                : '0 4px 16px rgba(37,99,235,0.4)',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 size={18} />
                </motion.div>
                Creating account...
              </>
            ) : 'Create Account →'}
          </button>
        </form>

        <div style={{
          borderTop: '1px solid #f1f5f9', marginTop: 20, paddingTop: 20,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 600,
              textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
