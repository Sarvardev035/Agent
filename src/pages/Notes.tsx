import { useEffect, useRef, useState } from 'react'
import { screenReader } from '../lib/screenReader'

interface Note {
  id: string
  title: string
  body: string
  color: string
  createdAt: string
  updatedAt: string
  pinned: boolean
}

const NOTE_COLORS = ['#fef3c7', '#fce7f3', '#ede9fe', '#dbeafe', '#d1fae5', '#fef2f2']
const NOTES_KEY = 'finly_notes'

const loadNotes = (): Note[] => {
  try {
    const s = localStorage.getItem(NOTES_KEY)
    return s ? (JSON.parse(s) as Note[]) : []
  } catch {
    return []
  }
}

const saveNotes = (notes: Note[]) => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [active, setActive] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const [isPhone, setIsPhone] = useState(() => window.matchMedia('(max-width: 768px)').matches)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const onChange = (e: MediaQueryListEvent) => setIsPhone(e.matches)
    if (media.addEventListener) {
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    }
    media.addListener(onChange)
    return () => media.removeListener(onChange)
  }, [])

  useEffect(() => {
    if (!active) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      setNotes(prev => {
        const updated = prev.map(n =>
          n.id === active.id
            ? {
                ...active,
                updatedAt: new Date().toISOString(),
              }
            : n
        )
        saveNotes(updated)
        return updated
      })
    }, 500)
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [active?.title, active?.body])

  const createNote = () => {
    const note: Note = {
      id: `note_${Date.now()}`,
      title: '',
      body: '',
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
    }
    const updated = [note, ...notes]
    setNotes(updated)
    saveNotes(updated)
    setActive(note)
    screenReader.speak('New note created', true)
  }

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id)
    setNotes(updated)
    saveNotes(updated)
    if (active?.id === id) setActive(null)
    screenReader.speak('Note deleted', true)
  }

  const exportNote = (note: Note) => {
    const content =
      `${note.title || 'Untitled'}\n` +
      `${'-'.repeat(40)}\n` +
      `${note.body}\n\n` +
      `Created: ${new Date(note.createdAt).toLocaleString()}\n` +
      `Updated: ${new Date(note.updatedAt).toLocaleString()}\n` +
      `- Finly Personal Finance`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title || 'note'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    screenReader.speak('Note exported', true)
  }

  const shareNote = async (note: Note) => {
    const text = `${note.title}\n\n${note.body}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title || 'My Finly Note',
          text,
        })
        screenReader.speak('Note shared', true)
      } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      alert('Note copied to clipboard!')
      screenReader.speak('Note copied to clipboard', true)
    }
  }

  const togglePin = (id: string) => {
    const updated = notes.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    setNotes(updated)
    saveNotes(updated)
  }

  const filtered = notes
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Notes 📝</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0' }}>
            {notes.length} note{notes.length !== 1 ? 's' : ''} · Auto-saved locally
          </p>
        </div>
        <button
          onClick={createNote}
          onFocus={() => screenReader.speak('Create new note')}
          onMouseEnter={() => screenReader.speak('Create new note')}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + New Note
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => screenReader.speak('Search notes input')}
        placeholder="Search notes..."
        style={{
          width: '100%',
          height: 42,
          padding: '0 14px',
          border: '1.5px solid var(--border)',
          borderRadius: 10,
          fontSize: 14,
          background: 'var(--input-bg)',
          color: 'var(--text-1)',
          marginBottom: 16,
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: active ? (isPhone ? '1fr' : '260px 1fr') : 'repeat(auto-fill,minmax(220px,1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            order: isPhone && active ? 2 : 1,
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
              <p>No notes yet. Create your first one!</p>
            </div>
          ) : (
            filtered.map(note => (
              <div
                key={note.id}
                onClick={() => setActive(note)}
                style={{
                  background: note.color,
                  borderRadius: 14,
                  padding: 14,
                  cursor: 'pointer',
                  border: active?.id === note.id ? '2px solid #7c3aed' : '2px solid transparent',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  screenReader.speak(`Open note ${note.title || 'Untitled'}`)
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {note.pinned && (
                  <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 12 }}>
                    📌
                  </span>
                )}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#1e293b',
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {note.title || 'Untitled'}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#475569',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4,
                  }}
                >
                  {note.body || 'Empty note...'}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        {active && (
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 400,
              order: isPhone ? 1 : 2,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                Auto-saving...
                <span style={{ marginLeft: 6 }}>💾</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {isPhone && (
                  <button
                    onClick={() => setActive(null)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: 'var(--text-2)',
                    }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={() => togglePin(active.id)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: 'var(--text-2)',
                  }}
                >
                  {active.pinned ? '📌 Unpin' : '📌 Pin'}
                </button>
                <button
                  onClick={() => exportNote(active)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: 'var(--text-2)',
                  }}
                >
                  ⬇ Export
                </button>
                <button
                  onClick={() => shareNote(active)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: 'var(--text-2)',
                  }}
                >
                  📤 Share
                </button>
                <button
                  onClick={() => deleteNote(active.id)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#ef4444',
                  }}
                >
                  🗑
                </button>
              </div>
            </div>

            <input
              value={active.title}
              onChange={e => setActive(p => (p ? { ...p, title: e.target.value } : p))}
              placeholder="Note title..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-1)',
                background: 'transparent',
                marginBottom: 10,
                width: '100%',
                fontFamily: 'inherit',
              }}
            />

            <textarea
              value={active.body}
              onChange={e => setActive(p => (p ? { ...p, body: e.target.value } : p))}
              placeholder={`Start writing your note...

💡 Ideas:
- Monthly savings goals
- Budget planning notes
- Expense review reminders
- Financial targets`}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--text-2)',
                background: 'transparent',
                resize: 'none',
                fontFamily: 'inherit',
                minHeight: 300,
              }}
            />

            <div style={{ fontSize: 11, color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
              {active.body.split(' ').filter(Boolean).length} words · {active.body.length} characters · Saved locally on your device
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notes
