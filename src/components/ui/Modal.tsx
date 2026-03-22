import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { modalVariants } from '../../utils/animations'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  footer?: React.ReactNode
  children: React.ReactNode
}

const Modal = ({ open, onClose, title, subtitle, footer, children }: ModalProps) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const labelledBy = useMemo(() => (title ? `modal-title-${title}` : undefined), [title])
  const panelVariants = isMobile
    ? {
        hidden: { opacity: 0, y: 120 },
        show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, y: 120, transition: { duration: 0.18 } },
      }
    : modalVariants

  if (!open) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            role="presentation"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,23,42,0.45)',
              backdropFilter: 'blur(10px)',
              zIndex: 90,
            }}
          />
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: isMobile ? 'flex-end' : 'center',
              justifyContent: 'center',
              padding: isMobile ? '12px 12px 20px' : '24px 16px',
              zIndex: 100,
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy}
              aria-describedby={subtitle ? `${labelledBy}-subtitle` : undefined}
              style={{
                width: '100%',
                maxWidth: isMobile ? undefined : 620,
                background: 'var(--surface)',
                borderRadius: isMobile ? '20px 20px 0 0' : 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                padding: 20,
                margin: isMobile ? '0 auto' : undefined,
                transformOrigin: 'center',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  {title && (
                    <h3 id={labelledBy} style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p
                      id={`${labelledBy}-subtitle`}
                      style={{ margin: '4px 0 0', color: 'var(--text-2)', fontSize: 13, lineHeight: 1.4 }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-3)',
                    padding: 6,
                  }}
                  aria-label="Close"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ marginTop: 12 }}>{children}</div>
              {footer && <div style={{ marginTop: 16 }}>{footer}</div>}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal
