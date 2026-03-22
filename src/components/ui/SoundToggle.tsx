import { useState } from 'react'
import { sounds } from '../../lib/sounds'

export const SoundToggle = () => {
  const [muted, setMuted] = useState(() => sounds.getMuted())

  const toggle = () => {
    const nowMuted = sounds.toggleMute()
    setMuted(nowMuted)
  }

  return (
    <button
      onClick={toggle}
      title={muted ? 'Enable sounds' : 'Mute sounds'}
      type="button"
      style={{
        width: 36,
        height: 36,
        background: muted ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)',
        border: `1.5px solid ${muted ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)'}`,
        borderRadius: 10,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.12)'
        e.currentTarget.style.background = muted ? 'rgba(239,68,68,0.2)' : 'rgba(124,58,237,0.2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.background = muted ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)'
      }}
      onMouseDown={e => {
        e.currentTarget.style.transform = 'scale(0.95)'
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'scale(1.12)'
      }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
