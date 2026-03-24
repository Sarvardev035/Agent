import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bitcoin,
  CircleDollarSign,
  Coins,
  Landmark,
  PiggyBank,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'

export type AddFamilyMemberPayload = {
  name: string
  email: string
  password: string
}

type AddFamilyMemberModalProps = {
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: AddFamilyMemberPayload) => Promise<void> | void
}

type FinanceOrbitIcon = {
  id: string
  Icon: LucideIcon
  color: string
  ring: number
  duration: number
  delay: number
  size: number
}

export const financeIconsArray: FinanceOrbitIcon[] = [
  { id: 'coins', Icon: Coins, color: '#f59e0b', ring: 132, duration: 16, delay: 0, size: 20 },
  { id: 'bitcoin', Icon: Bitcoin, color: '#f97316', ring: 132, duration: 14, delay: 1.3, size: 19 },
  { id: 'dollar', Icon: CircleDollarSign, color: '#10b981', ring: 132, duration: 18, delay: 2.6, size: 20 },
  { id: 'wallet', Icon: Wallet, color: '#38bdf8', ring: 172, duration: 21, delay: 0.8, size: 21 },
  { id: 'bank', Icon: Landmark, color: '#8b5cf6', ring: 172, duration: 24, delay: 2.2, size: 20 },
  { id: 'savings', Icon: PiggyBank, color: '#ec4899', ring: 172, duration: 19, delay: 3.1, size: 20 },
]

const AddFamilyMemberModal = ({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddFamilyMemberModalProps) => {
  const [fullName, setFullName] = useState('')
  const [gmail, setGmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, isSubmitting, onClose])

  const canSubmit = useMemo(
    () => fullName.trim().length > 1 && gmail.trim().length > 0 && password.length >= 8,
    [fullName, gmail, password]
  )

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    const name = fullName.trim()
    const email = gmail.trim().toLowerCase()

    if (!name || !email || !password) {
      setError('Please fill Username, Gmail address, and Password.')
      return
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      setError('Please enter a valid Gmail address ending with @gmail.com.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setError('')
    await onSubmit({ name, email, password })
    setFullName('')
    setGmail('')
    setPassword('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 240,
            background: 'rgba(2, 6, 23, 0.64)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'grid',
            placeItems: 'center',
            padding: 12,
          }}
          onMouseDown={event => {
            if (event.target === event.currentTarget && !isSubmitting) onClose()
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 210, damping: 22 }}
            style={{
              width: 'min(60vw, 980px)',
              height: 'min(80vh, 760px)',
              maxWidth: '100vw',
              maxHeight: '100dvh',
              borderRadius: 20,
              border: '1px solid rgba(148, 163, 184, 0.28)',
              background:
                'linear-gradient(130deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.96) 42%, rgba(17,24,39,0.96) 100%)',
              boxShadow: '0 30px 120px rgba(2, 6, 23, 0.5)',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'minmax(300px, 46%) minmax(0, 54%)',
              position: 'relative',
            }}
            className="add-family-modal"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                width: 34,
                height: 34,
                borderRadius: 999,
                border: '1px solid rgba(203,213,225,0.42)',
                background: 'rgba(15,23,42,0.6)',
                color: '#e2e8f0',
                cursor: isSubmitting ? 'wait' : 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
              aria-label="Close add family member modal"
            >
              <X size={18} />
            </button>

            <div
              style={{
                borderRight: '1px solid rgba(148,163,184,0.16)',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 999,
                    background: 'rgba(16,185,129,0.18)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(52,211,153,0.4)',
                    padding: '6px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Finance Access
                </div>
                <h2 style={{ margin: '14px 0 8px', color: '#f8fafc', fontSize: 30, lineHeight: 1.1, fontWeight: 800 }}>
                  Add Family Member
                </h2>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.5 }}>
                  Invite someone to track finances together with synced shared accounts and collaborative budgeting.
                </p>
              </div>

              <div style={{ position: 'relative', minHeight: 290, display: 'grid', placeItems: 'center' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    border: '1px dashed rgba(148,163,184,0.28)',
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: 280,
                    height: 280,
                    borderRadius: '50%',
                    border: '1px dashed rgba(148,163,184,0.2)',
                  }}
                />

                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, #34d399, #047857)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#ecfdf5',
                    boxShadow: '0 0 0 8px rgba(16,185,129,0.2)',
                    zIndex: 2,
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: '0.05em',
                  }}
                >
                  FAMILY
                </div>

                {financeIconsArray.map(item => {
                  const Icon = item.Icon
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: item.duration,
                        ease: 'linear',
                        delay: item.delay,
                      }}
                      style={{
                        position: 'absolute',
                        width: item.ring * 2,
                        height: item.ring * 2,
                        borderRadius: '50%',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: 0,
                          transform: 'translate(-50%, -50%)',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'rgba(15,23,42,0.88)',
                          border: `1px solid ${item.color}`,
                          color: item.color,
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: `0 10px 24px ${item.color}33`,
                        }}
                      >
                        <Icon size={item.size} />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <form onSubmit={submit} style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 700 }}>Username (Full Name)</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={event => {
                    setFullName(event.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Enter full name"
                  style={{
                    height: 44,
                    borderRadius: 10,
                    border: '1px solid rgba(148,163,184,0.35)',
                    background: 'rgba(15,23,42,0.72)',
                    color: '#f8fafc',
                    padding: '0 12px',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  required
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 700 }}>Gmail Address</span>
                <input
                  type="email"
                  value={gmail}
                  onChange={event => {
                    setGmail(event.target.value)
                    if (error) setError('')
                  }}
                  placeholder="example@gmail.com"
                  style={{
                    height: 44,
                    borderRadius: 10,
                    border: '1px solid rgba(148,163,184,0.35)',
                    background: 'rgba(15,23,42,0.72)',
                    color: '#f8fafc',
                    padding: '0 12px',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  required
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 700 }}>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={event => {
                    setPassword(event.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Minimum 8 characters"
                  style={{
                    height: 44,
                    borderRadius: 10,
                    border: '1px solid rgba(148,163,184,0.35)',
                    background: 'rgba(15,23,42,0.72)',
                    color: '#f8fafc',
                    padding: '0 12px',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  required
                  minLength={8}
                />
              </label>

              {error && (
                <div
                  style={{
                    borderRadius: 10,
                    border: '1px solid rgba(252, 93, 93, 0.4)',
                    background: 'rgba(127, 29, 29, 0.28)',
                    color: '#fecaca',
                    padding: '10px 12px',
                    fontSize: 12,
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginTop: 'auto', display: 'grid', gap: 10 }}>
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  style={{
                    height: 46,
                    borderRadius: 12,
                    border: '1px solid rgba(16,185,129,0.45)',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.35), rgba(56,189,248,0.3))',
                    color: '#ecfeff',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: !canSubmit || isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: !canSubmit || isSubmitting ? 0.65 : 1,
                  }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
                <div style={{ color: '#94a3b8', fontSize: 11, textAlign: 'center' }}>
                  This creates a member account for shared finance tracking and editing permissions.
                </div>
              </div>
            </form>

            <style>{`
              @media (max-width: 900px) {
                .add-family-modal {
                  width: min(100vw, 100%) !important;
                  height: min(100dvh, 100%) !important;
                  border-radius: 0 !important;
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AddFamilyMemberModal
