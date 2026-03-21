import { AlertTriangle, Trash2 } from 'lucide-react'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onCancel} title={title} subtitle={message}>
    <div style={{ textAlign: 'center', padding: '10px 6px 0' }}>
      <div
        style={{
          width: 60,
          height: 60,
          margin: '0 auto 12px',
          borderRadius: '50%',
          background: '#fff1f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          boxShadow: '0 12px 24px rgba(239,68,68,0.2)',
        }}
      >
        <AlertTriangle size={22} />
      </div>

      <p style={{ color: '#475569', fontSize: 14, margin: '0 0 12px' }}>{message}</p>

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            cursor: 'pointer',
            fontWeight: 700,
            color: '#0f172a',
          }}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            background: '#ef4444',
            color: '#ffffff',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(239,68,68,0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          type="button"
        >
          <Trash2 size={18} />
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
)

export default ConfirmDialog
