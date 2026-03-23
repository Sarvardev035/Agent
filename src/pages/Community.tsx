import { useState } from 'react'
import { screenReader } from '../lib/screenReader'

interface Comment {
  id:        string
  author:    string
  avatar:    string
  text:      string
  time:      string
  likes:     number
  likedByMe: boolean
  pinned?:   boolean
  tag?:      string
}

const DEMO_COMMENTS: Comment[] = [
  {
    id: 'demo1',
    author: 'Finly Team',
    avatar: '⚡',
    text: 'Welcome to the Finly community! 🎉 Share your money tips, ' +
          'budgeting tricks, and financial wins here. ' +
          'Together we save smarter!',
    time: '2 hours ago',
    likes: 24,
    likedByMe: false,
    pinned: true,
    tag: '📌 Pinned',
  },
  {
    id: 'demo2',
    author: 'Sarvar M.',
    avatar: '💰',
    text: 'Pro tip: Set your budget limit to 80% of your actual budget. ' +
          'The remaining 20% goes straight to savings. ' +
          'Changed my financial life in 3 months!',
    time: '5 hours ago',
    likes: 18,
    likedByMe: false,
    tag: '💡 Tip',
  },
  {
    id: 'demo3',
    author: 'Malika K.',
    avatar: '🎯',
    text: 'I tracked every expense for 30 days and discovered I was ' +
          'spending 40% of my income on food delivery. ' +
          'Now I cook at home and save 2M UZS per month! ' +
          'Finly made me see this clearly 📊',
    time: '1 day ago',
    likes: 31,
    likedByMe: false,
    tag: '🏆 Win',
  },
  {
    id: 'demo4',
    author: 'Jasur T.',
    avatar: '📈',
    text: 'The debt tracking feature is incredible. ' +
          'I had 5 different people owing me money and ' +
          'I forgot about 3 of them! Finly reminded me and ' +
          'I recovered 800,000 UZS I thought was lost. 🙏',
    time: '2 days ago',
    likes: 15,
    likedByMe: false,
    tag: '✅ Success',
  },
  {
    id: 'demo5',
    author: 'Nilufar S.',
    avatar: '🌟',
    text: 'Challenge for everyone: try the zero-based budget method. ' +
          'Every sum you earn gets assigned a job. ' +
          'At the end of the month: income minus budget = zero. ' +
          'Nothing wasted, everything planned. Who is trying this? 💪',
    time: '3 days ago',
    likes: 42,
    likedByMe: false,
    tag: '🎯 Challenge',
  },
]

const STORAGE_KEY = 'finly_community_comments'

const loadComments = (): Comment[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const userComments = JSON.parse(saved) as Comment[]
      return [...DEMO_COMMENTS, ...userComments]
    }
  } catch {}
  return DEMO_COMMENTS
}

const saveUserComment = (comment: Comment) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const existing: Comment[] = saved ? JSON.parse(saved) : []
    existing.unshift(comment)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {}
}

const TAGS = [
  '💬 General', '💡 Tip', '🏆 Win',
  '❓ Question', '🎯 Challenge', '📊 Data',
]

const Community = () => {
  const [comments, setComments] = useState<Comment[]>(loadComments)
  const [newText, setNewText] = useState('')
  const [newTag, setNewTag] = useState('💬 General')
  const [charCount, setCharCount] = useState(0)
  const MAX_CHARS = 300
const WARN_THRESHOLD = MAX_CHARS * 0.8

  const userName = localStorage.getItem('finly_user_name') || 'You'

  const handlePost = () => {
    if (!newText.trim() || newText.length > MAX_CHARS) return
    const comment: Comment = {
      id:        `user_${Date.now()}`,
      author:    userName,
      avatar:    '😊',
      text:      newText.trim(),
      time:      'Just now',
      likes:     0,
      likedByMe: false,
      tag:       newTag,
    }
    saveUserComment(comment)
    setComments(loadComments())
    setNewText('')
    setCharCount(0)
    screenReader.speak('Comment posted successfully!')
  }

  const handleLike = (id: string) => {
    setComments(prev => prev.map(c =>
      c.id === id
        ? { ...c, likes: c.likedByMe ? c.likes - 1 : c.likes + 1, likedByMe: !c.likedByMe }
        : c
    ))
    try {
      const liked: string[] = JSON.parse(localStorage.getItem('finly_liked') || '[]')
      const idx = liked.indexOf(id)
      if (idx > -1) liked.splice(idx, 1)
      else liked.push(id)
      localStorage.setItem('finly_liked', JSON.stringify(liked))
    } catch {}
  }

  return (
    <div className="page-content">
      <h1 style={{
        fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800,
        color: 'var(--text-1)', marginBottom: 4,
      }}>
        Community 💬
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>
        Share tips, celebrate wins, help each other save smarter.
      </p>

      {/* Write a comment */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
          Share something with the community
        </div>

        {/* Tag selector */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {TAGS.map(tag => (
            <button key={tag}
              onClick={() => setNewTag(tag)}
              style={{
                padding: '4px 10px', borderRadius: 20,
                border: `1px solid ${newTag === tag ? '#7c3aed' : 'var(--border)'}`,
                background: newTag === tag ? 'rgba(124,58,237,0.1)' : 'transparent',
                color: newTag === tag ? '#7c3aed' : 'var(--text-3)',
                fontSize: 12, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <textarea
          value={newText}
          onChange={e => {
            setNewText(e.target.value)
            setCharCount(e.target.value.length)
          }}
          placeholder={`What's your financial tip, ${userName}?`}
          maxLength={MAX_CHARS}
          rows={3}
          style={{
            width: '100%', padding: 12,
            border: '1.5px solid var(--border)',
            borderRadius: 12, fontSize: 14,
            background: 'var(--input-bg)',
            color: 'var(--text-1)', resize: 'vertical',
            fontFamily: 'inherit', outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{
            fontSize: 12,
            color: charCount > WARN_THRESHOLD ? '#f59e0b' : 'var(--text-3)',
          }}>
            {charCount}/{MAX_CHARS}
          </span>
          <button
            onClick={handlePost}
            disabled={!newText.trim()}
            style={{
              padding: '9px 20px',
              background: !newText.trim()
                ? 'var(--border)'
                : 'linear-gradient(135deg,#7c3aed,#2563eb)',
              color: !newText.trim() ? 'var(--text-3)' : 'white',
              border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              cursor: !newText.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Post 🚀
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.map(c => (
          <div key={c.id} className="card"
            style={{ borderLeft: c.pinned ? '3px solid #7c3aed' : 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, flexShrink: 0,
                }}>
                  {c.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>
                    {c.author}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {c.time}
                  </div>
                </div>
              </div>
              {c.tag && (
                <span style={{
                  padding: '3px 10px', borderRadius: 20,
                  background: 'rgba(124,58,237,0.08)',
                  color: '#7c3aed', fontSize: 11, fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}>
                  {c.tag}
                </span>
              )}
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 12px' }}>
              {c.text}
            </p>

            <button onClick={() => handleLike(c.id)}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13,
                color: c.likedByMe ? '#ef4444' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.15s',
                padding: '4px 8px', borderRadius: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              {c.likedByMe ? '❤️' : '🤍'} {c.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Community
