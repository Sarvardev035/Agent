import { useState, useEffect } from 'react'
import { X, Trash2, Users } from 'lucide-react'
import { familyStorageService, type FamilyMember } from '../../services/family-storage.service'
import AddFamilyMemberModal, { type AddFamilyMemberPayload } from './AddFamilyMemberModal'

interface FamilyShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FamilyShareModal = ({ isOpen, onClose }: FamilyShareModalProps) => {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
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

  const handleCreate = async (payload: AddFamilyMemberPayload) => {
    const name = payload.name.trim()
    const email = payload.email.trim().toLowerCase()

    if (!name || !email || !payload.password) {
      setError('Please fill Username, Gmail address, and Password.')
      return
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      setError('Please use a valid Gmail address.')
      return
    }

    if (payload.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      setError('This Gmail account is already in your family.')
      return
    }

    setCreating(true)
    setError('')

    try {
      const newMember = familyStorageService.add({
        name,
        email,
        role: 'EDITOR',
      })

      setMembers(prev => [...prev, newMember])
      setShowAddModal(false)
      setNotice('Family member account created successfully.')

      setTimeout(() => setNotice(''), 3000)
    } catch {
      setError('Could not create account. Please try again.')
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
          <div
            style={{
              marginBottom: 18,
              borderRadius: 12,
              border: '1px solid rgba(148,163,184,0.22)',
              background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.08))',
              padding: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>
                  Invite and create account
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  Add a family member to track or edit shared finances.
                </div>
              </div>
              <button
                type="button"
                data-button-reset="true"
                onClick={() => {
                  setError('')
                  setShowAddModal(true)
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: 9,
                  border: '1px solid rgba(52,211,153,0.38)',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.24), rgba(56,189,248,0.22))',
                  color: '#ccfbf1',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Add to family
              </button>
            </div>
            {error && <div style={{ marginTop: 10, fontSize: 12, color: '#fda4af' }}>{error}</div>}
            {notice && <div style={{ marginTop: 10, fontSize: 12, color: '#86efac' }}>{notice}</div>}
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
      <AddFamilyMemberModal
        isOpen={showAddModal}
        isSubmitting={creating}
        onClose={() => {
          if (creating) return
          setShowAddModal(false)
        }}
        onSubmit={handleCreate}
      />
    </div>
  )
}
