import { useState, useEffect } from 'react'
import { X, Trash2, Users } from 'lucide-react'
import { familyStorageService, type FamilyMember } from '../../services/family-storage.service'

interface FamilyShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FamilyShareModal = ({ isOpen, onClose }: FamilyShareModalProps) => {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'EDITOR' as 'EDITOR' | 'VIEWER',
  })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const loadMembers = () => {
    const all = familyStorageService.getAll()
    setMembers(all)
  }

  useEffect(() => {
    if (isOpen) {
      loadMembers()
    }
  }, [isOpen])

  const handleCreate = () => {
    const name = form.name.trim()
    const email = form.email.trim()

    if (!name || !email) {
      setError('Please fill in both name and email')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      setError('This email is already in your family')
      return
    }

    setCreating(true)
    setError('')

    try {
      const newMember = familyStorageService.add({
        name,
        email,
        role: form.role,
      })

      setMembers(prev => [...prev, newMember])
      setForm({ name: '', email: '', role: 'EDITOR' })
      setNotice('Family member added successfully! They can now access shared data.')

      setTimeout(() => setNotice(''), 3000)
    } catch {
      setError('Could not add family member. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleRemove = (id: string) => {
    try {
      familyStorageService.remove(id)
      setMembers(prev => prev.filter(m => m.id !== id))
      setNotice('Family member removed.')
      setTimeout(() => setNotice(''), 2000)
    } catch {
      setError('Could not remove member.')
    }
  }

  const handleRoleChange = (id: string, newRole: 'EDITOR' | 'VIEWER') => {
    try {
      familyStorageService.update(id, { role: newRole })
      setMembers(prev => prev.map(m => (m.id === id ? { ...m, role: newRole } : m)))
      setNotice('Permissions updated.')
      setTimeout(() => setNotice(''), 2000)
    } catch {
      setError('Could not update permissions.')
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2,6,23,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: 'min(560px, 100%)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          background: 'var(--surface-strong)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 20 }}>👨‍👩‍👧‍👦</div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>
              Family Sharing
            </h2>
          </div>
          <button
            type="button"
            data-button-reset="true"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Add Member Section */}
          <div
            style={{
              marginBottom: 24,
              borderRadius: 12,
              border: '1px solid rgba(148,163,184,0.22)',
              background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.08))',
              padding: 20,
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
              Add family member
            </h3>

            <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={e => {
                  setForm(prev => ({ ...prev, name: e.target.value }))
                  setError('')
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(148,163,184,0.3)',
                  background: 'rgba(15,23,42,0.8)',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => {
                  setForm(prev => ({ ...prev, email: e.target.value }))
                  setError('')
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(148,163,184,0.3)',
                  background: 'rgba(15,23,42,0.8)',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <select
                value={form.role}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    role: e.target.value === 'VIEWER' ? 'VIEWER' : 'EDITOR',
                  }))
                }
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(148,163,184,0.3)',
                  background: 'rgba(15,23,42,0.8)',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                }}
              >
                <option value="EDITOR">📝 Editor — can add & edit transactions</option>
                <option value="VIEWER">👁️ Viewer — read-only access</option>
              </select>
            </div>

            <button
              type="button"
              data-button-reset="true"
              onClick={() => void handleCreate()}
              disabled={creating}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(56,189,248,0.4)',
                background: 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(99,102,241,0.25))',
                color: '#dbeafe',
                fontSize: 13,
                fontWeight: 600,
                cursor: creating ? 'wait' : 'pointer',
              }}
            >
              {creating ? 'Adding...' : 'Add to family'}
            </button>

            {error && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#fda4af' }}>
                {error}
              </div>
            )}
            {notice && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#86efac' }}>
                {notice}
              </div>
            )}
          </div>

          {/* Members List */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
              <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
              Family members ({members.length})
            </h3>

            {members.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  borderRadius: 8,
                  background: 'rgba(226,232,240,0.05)',
                  color: 'var(--text-3)',
                  fontSize: 13,
                }}
              >
                No family members yet — add one above to get started.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {members.map(member => (
                  <div
                    key={member.id}
                    style={{
                      borderRadius: 8,
                      border: '1px solid rgba(148,163,184,0.22)',
                      background: 'rgba(15,23,42,0.5)',
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                        {member.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-3)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {member.email}
                      </div>
                    </div>

                    <select
                      value={member.role}
                      onChange={e =>
                        handleRoleChange(member.id, e.target.value === 'VIEWER' ? 'VIEWER' : 'EDITOR')
                      }
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid rgba(148,163,184,0.3)',
                        background: 'rgba(15,23,42,0.8)',
                        color: '#e2e8f0',
                        fontSize: 11,
                        outline: 'none',
                        minWidth: 100,
                      }}
                    >
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>

                    <button
                      type="button"
                      data-button-reset="true"
                      onClick={() => handleRemove(member.id)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: '1px solid rgba(252,93,93,0.3)',
                        background: 'rgba(252,165,165,0.08)',
                        color: '#fca5a5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p
              style={{
                marginTop: 16,
                fontSize: 11,
                color: 'var(--text-3)',
                lineHeight: 1.5,
              }}
            >
              Data is saved locally on your device. Family members will see shared transactions and accounts based on their role.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
