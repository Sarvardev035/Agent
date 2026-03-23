import { useState, useEffect } from 'react'
import { usersService } from '../../services/users.service'
import { sounds } from '../../lib/sounds'
import toast from 'react-hot-toast'

type Tab = 'name' | 'password' | 'email'

interface Props {
  onClose: () => void
}

export const ProfileModal = ({ onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>('name')
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  // Name form
  const [fullName, setFullName] = useState('')

  // Password form
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  // Email form
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  // Password strength
  const passStrength = (p: string): {
    score: number
    label: string
    color: string
  } => {
    if (!p) return { score: 0, label: '', color: '#e2e8f0' }
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    const map = [
      { score: 1, label: 'Weak', color: '#ef4444' },
      { score: 2, label: 'Fair', color: '#f59e0b' },
      { score: 3, label: 'Good', color: '#3b82f6' },
      { score: 4, label: 'Strong', color: '#10b981' },
    ]
    return map[s - 1] ?? { score: 0, label: '', color: '#e2e8f0' }
  }

  const strength = passStrength(newPass)

  // Load user data on open
  useEffect(() => {
    usersService
      .getMe()
      .then(res => {
        const d = res.data?.data || res.data
        setUserData(d)
        setFullName(
          d?.fullName ||
            d?.name ||
            localStorage.getItem('finly_user_name') ||
            ''
        )
        setNewEmail(
          d?.email || localStorage.getItem('finly_user_email') || ''
        )
      })
      .catch(() => {
        setFullName(localStorage.getItem('finly_user_name') || '')
        setNewEmail(localStorage.getItem('finly_user_email') || '')
      })
  }, [])

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const handleNameSave = async () => {
    if (!fullName.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setLoading(true)
    try {
      await usersService.updateName(fullName.trim())
      localStorage.setItem('finly_user_name', fullName.trim())
      sounds.success()
      toast.success('Name updated successfully! ✅')
      onClose()
    } catch (err: any) {
      sounds.error()
      toast.error(err.message || 'Failed to update name')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSave = async () => {
    if (!currentPass) {
      toast.error('Enter your current password')
      return
    }
    if (newPass.length < 8) {
      sounds.error()
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPass !== confirmPass) {
      sounds.error()
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await usersService.updatePassword(currentPass, newPass)
      sounds.success()
      toast.success('Password changed! 🔒')
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
      onClose()
    } catch (err: any) {
      sounds.error()
      toast.error(err.message || 'Incorrect current password')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSave = async () => {
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error('Enter a valid email address')
      return
    }
    if (!emailPassword) {
      toast.error('Enter your password to confirm')
      return
    }
    setLoading(true)
    try {
      await usersService.updateEmail(newEmail, emailPassword)
      localStorage.setItem('finly_user_email', newEmail)
      sounds.success()
      toast.success('Email updated! 📧')
      onClose()
    } catch (err: any) {
      sounds.error()
      toast.error(err.message || 'Failed to update email')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (focused = false): React.CSSProperties => ({
    width: '100%',
    height: 46,
    padding: '0 14px',
    background: 'rgba(255,255,255,0.07)',
    border: `1.5px solid ${
      focused ? 'rgba(124,58,237,0.8)' : 'rgba(255,255,255,0.15)'
    }`,
    borderRadius: 12,
    color: 'white',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
  })

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'name', label: 'Full Name', icon: '👤' },
    { key: 'password', label: 'Password', icon: '🔒' },
    { key: 'email', label: 'Email', icon: '📧' },
  ]

  const userName = localStorage.getItem('finly_user_name') || 'User'
  const userEmail = localStorage.getItem('finly_user_email') || ''
  const initials = userName.substring(0, 2).toUpperCase()

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const isTablet =
    typeof window !== 'undefined' &&
    window.innerWidth > 768 &&
    window.innerWidth <= 1024

  return (
    <>
      {/* Overlay */}
      <div
        onClick={e => e.target === e.currentTarget && onClose()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,5,20,0.75)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 500,
          padding: isMobile ? 0 : 20,
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Glass modal */}
        <div
          style={{
            background: 'rgba(12,16,42,0.88)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            border: '1px solid rgba(124,58,237,0.3)',
            width: isMobile ? '100%' : isTablet ? '70vw' : '50vw',
            height: isMobile ? '85vh' : isTablet ? '75vh' : '70vh',
            maxWidth: isMobile ? '100%' : 640,
            borderRadius: isMobile ? '20px 20px 0 0' : 20,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.04) inset,' +
              '0 32px 80px rgba(0,0,0,0.7),' +
              '0 0 100px rgba(124,58,237,0.12)',
            animation: isMobile
              ? 'slideFromBottom 0.3s cubic-bezier(0.4,0,0.2,1)'
              : 'scaleIn 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* HEADER — fixed, does not scroll */}
          <div
            style={{
              background:
                'linear-gradient(180deg,' +
                'rgba(124,58,237,0.18) 0%,' +
                'transparent 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: isMobile ? '16px 20px' : '20px 28px',
              flexShrink: 0,
            }}
          >
            {/* Close + title row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '-0.01em',
                }}
              >
                Edit Profile
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 30,
                  height: 30,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
                  e.currentTarget.style.color = '#ef4444'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Avatar row — horizontal, saves space */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: isMobile ? 48 : 56,
                  height: isMobile ? 48 : 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 800,
                  color: 'white',
                  flexShrink: 0,
                  boxShadow: '0 0 0 3px rgba(124,58,237,0.25)',
                }}
              >
                {initials}
              </div>
              <div>
                <div
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {userName}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: 2,
                  }}
                >
                  {userEmail}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 10,
                padding: 3,
              }}
            >
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: isMobile ? '7px 4px' : '8px 6px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: isMobile ? 11 : 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    background:
                      activeTab === tab.key
                        ? 'rgba(124,58,237,0.4)'
                        : 'transparent',
                    color:
                      activeTab === tab.key
                        ? 'white'
                        : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: isMobile ? 13 : 15 }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* BODY — scrollable */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '20px 20px' : '24px 28px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(124,58,237,0.3) transparent',
            }}
          >
            {/* ── NAME TAB ── */}
            {activeTab === 'name' && (
              <div
                style={{
                  animation: 'slideUp 0.2s ease-out',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    marginBottom: 8,
                  }}
                >
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  maxLength={100}
                  style={inputStyle()}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(124,58,237,0.8)'
                    e.target.style.boxShadow =
                      '0 0 0 3px rgba(124,58,237,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.15)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.3)',
                    marginTop: 8,
                  }}
                >
                  This name appears in greetings and your profile
                </div>
              </div>
            )}

            {/* ── PASSWORD TAB ── */}
            {activeTab === 'password' && (
              <div style={{ animation: 'slideUp 0.2s ease-out' }}>
                {/* Current password */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 8,
                    }}
                  >
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPass}
                      onChange={e => setCurrentPass(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        ...inputStyle(),
                        paddingRight: 44,
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'rgba(124,58,237,0.8)'
                        e.target.style.boxShadow =
                          '0 0 0 3px rgba(124,58,237,0.15)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor =
                          'rgba(255,255,255,0.15)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(p => !p)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showCurrent ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 8,
                    }}
                  >
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Min 8 characters"
                      style={{
                        ...inputStyle(),
                        paddingRight: 44,
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'rgba(124,58,237,0.8)'
                        e.target.style.boxShadow =
                          '0 0 0 3px rgba(124,58,237,0.15)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor =
                          'rgba(255,255,255,0.15)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(p => !p)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showNew ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPass && (
                    <div style={{ marginTop: 8 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: 4,
                          marginBottom: 4,
                        }}
                      >
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 3,
                              borderRadius: 2,
                              background:
                                i <= strength.score
                                  ? strength.color
                                  : 'rgba(255,255,255,0.1)',
                              transition: 'background 0.3s',
                            }}
                          />
                        ))}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: strength.color,
                        }}
                      >
                        {strength.label}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div style={{ marginBottom: 6 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 8,
                    }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Repeat new password"
                    style={{
                      ...inputStyle(),
                      borderColor:
                        confirmPass && newPass !== confirmPass
                          ? '#ef4444'
                          : confirmPass && newPass === confirmPass
                            ? '#10b981'
                            : 'rgba(255,255,255,0.15)',
                    }}
                    onFocus={e => {
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(124,58,237,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {confirmPass && newPass !== confirmPass && (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#ef4444',
                        marginTop: 4,
                      }}
                    >
                      Passwords do not match
                    </div>
                  )}
                  {confirmPass && newPass === confirmPass && (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#10b981',
                        marginTop: 4,
                      }}
                    >
                      ✓ Passwords match
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── EMAIL TAB ── */}
            {activeTab === 'email' && (
              <div style={{ animation: 'slideUp 0.2s ease-out' }}>
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 8,
                    }}
                  >
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={inputStyle()}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(124,58,237,0.8)'
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(124,58,237,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.15)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 8,
                    }}
                  >
                    Confirm with Password
                  </label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={e => setEmailPassword(e.target.value)}
                    placeholder="Enter your current password"
                    style={inputStyle()}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(124,58,237,0.8)'
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(124,58,237,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.15)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    ⚠️ You will need to log in again with your new email
                    address.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER — fixed, does not scroll */}
          <div
            style={{
              padding: isMobile ? '16px 20px' : '16px 28px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <button
              onClick={
                activeTab === 'name'
                  ? handleNameSave
                  : activeTab === 'password'
                    ? handlePasswordSave
                    : handleEmailSave
              }
              disabled={loading}
              style={{
                width: '100%',
                height: isMobile ? 46 : 50,
                background: loading
                  ? 'rgba(124,58,237,0.35)'
                  : 'linear-gradient(135deg,#7c3aed,#2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: isMobile ? 14 : 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                boxShadow: loading
                  ? 'none'
                  : '0 4px 20px rgba(124,58,237,0.35)',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow =
                    '0 8px 28px rgba(124,58,237,0.5)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow =
                  '0 4px 20px rgba(124,58,237,0.35)'
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  {activeTab === 'name'
                    ? '✓ Update Name'
                    : activeTab === 'password'
                      ? '🔒 Change Password'
                      : '📧 Update Email'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
