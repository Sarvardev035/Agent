import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { screenReader } from '../lib/screenReader';
const DEMO_COMMENTS = [
    {
        id: 'demo1',
        author: 'Finly Team',
        avatar: '⚡',
        text: 'Welcome to the Finly community! 🎉 Share your money tips, budgeting tricks, and financial wins here. Together we save smarter!',
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
        text: 'Pro tip: Set your budget limit to 80% of your actual budget. The remaining 20% goes straight to savings. Changed my financial life in 3 months!',
        time: '5 hours ago',
        likes: 18,
        likedByMe: false,
        tag: '💡 Tip',
    },
    {
        id: 'demo3',
        author: 'Malika K.',
        avatar: '🎯',
        text: 'I tracked every expense for 30 days and discovered I was spending 40% of my income on food delivery. Now I cook at home and save 2M UZS per month! Finly made me see this clearly 📊',
        time: '1 day ago',
        likes: 31,
        likedByMe: false,
        tag: '🏆 Win',
    },
    {
        id: 'demo4',
        author: 'Jasur T.',
        avatar: '📈',
        text: 'The debt tracking feature is incredible. I had 5 different people owing me money and I forgot about 3 of them! Finly reminded me and I recovered 800,000 UZS I thought was lost. 🙏',
        time: '2 days ago',
        likes: 15,
        likedByMe: false,
        tag: '✅ Success',
    },
    {
        id: 'demo5',
        author: 'Nilufar S.',
        avatar: '🌟',
        text: 'Challenge for everyone: try the zero-based budget method. Every sum you earn gets assigned a job. At the end of the month: income minus budget = zero. Nothing wasted, everything planned. Who is trying this? 💪',
        time: '3 days ago',
        likes: 42,
        likedByMe: false,
        tag: '🎯 Challenge',
    },
];
const STORAGE_KEY = 'finly_community_comments';
const LIKED_KEY = 'finly_liked_comments';
const loadLiked = () => {
    try {
        const raw = localStorage.getItem(LIKED_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
};
const loadComments = () => {
    try {
        const liked = new Set(loadLiked());
        const saved = localStorage.getItem(STORAGE_KEY);
        const userComments = saved ? JSON.parse(saved) : [];
        return [...DEMO_COMMENTS, ...userComments].map(comment => ({
            ...comment,
            likedByMe: liked.has(comment.id),
        }));
    }
    catch {
        return DEMO_COMMENTS;
    }
};
const saveUserComment = (comment) => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const existing = saved ? JSON.parse(saved) : [];
        existing.unshift(comment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
    catch { }
};
const TAGS = ['💬 General', '💡 Tip', '🏆 Win', '❓ Question', '🎯 Challenge', '📊 Data'];
const MAX_CHARS = 300;
const Community = () => {
    const [comments, setComments] = useState(loadComments);
    const [newText, setNewText] = useState('');
    const [newTag, setNewTag] = useState('💬 General');
    const [charCount, setCharCount] = useState(0);
    const userName = useMemo(() => localStorage.getItem('finly_user_name') || 'You', []);
    const handlePost = () => {
        if (!newText.trim()) {
            screenReader.speak('Error: comment text is empty.', true);
            return;
        }
        if (newText.length > MAX_CHARS) {
            screenReader.speak('Error: comment is too long.', true);
            return;
        }
        const comment = {
            id: `user_${Date.now()}`,
            author: userName,
            avatar: '😊',
            text: newText.trim(),
            time: 'Just now',
            likes: 0,
            likedByMe: false,
            tag: newTag,
        };
        saveUserComment(comment);
        setComments(loadComments());
        setNewText('');
        setCharCount(0);
        screenReader.speak('Comment posted successfully!', true);
    };
    const handleLike = (id) => {
        setComments(prev => prev.map(c => c.id === id
            ? { ...c, likes: c.likedByMe ? c.likes - 1 : c.likes + 1, likedByMe: !c.likedByMe }
            : c));
        const liked = loadLiked();
        const idx = liked.indexOf(id);
        if (idx > -1)
            liked.splice(idx, 1);
        else
            liked.push(id);
        localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
    };
    return (_jsxs("div", { className: "page-content", children: [_jsx("h1", { style: { fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }, children: "Community \uD83D\uDCAC" }), _jsx("p", { style: { fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }, children: "Share tips, celebrate wins, help each other save smarter." }), _jsxs("div", { className: "card", style: { marginBottom: 20 }, children: [_jsx("div", { style: { fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }, children: "Share something with the community" }), _jsx("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }, children: TAGS.map(tag => (_jsx("button", { onClick: () => setNewTag(tag), onFocus: () => screenReader.speak(`Tag ${tag}`), onMouseEnter: () => screenReader.speak(`Tag ${tag}`), style: {
                                padding: '4px 10px',
                                borderRadius: 20,
                                border: `1px solid ${newTag === tag ? '#7c3aed' : 'var(--border)'}`,
                                background: newTag === tag ? 'rgba(124,58,237,0.1)' : 'transparent',
                                color: newTag === tag ? '#7c3aed' : 'var(--text-3)',
                                fontSize: 12,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }, children: tag }, tag))) }), _jsx("textarea", { value: newText, onChange: e => {
                            setNewText(e.target.value);
                            setCharCount(e.target.value.length);
                        }, placeholder: `What's your financial tip, ${userName}?`, maxLength: MAX_CHARS, rows: 3, style: {
                            width: '100%',
                            padding: 12,
                            border: '1.5px solid var(--border)',
                            borderRadius: 12,
                            fontSize: 14,
                            background: 'var(--input-bg)',
                            color: 'var(--text-1)',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box',
                        }, onFocus: e => {
                            e.target.style.borderColor = '#7c3aed';
                            screenReader.speak('Comment input area');
                        }, onBlur: e => {
                            e.target.style.borderColor = 'var(--border)';
                        } }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }, children: [_jsxs("span", { style: { fontSize: 12, color: charCount > MAX_CHARS * 0.8 ? '#f59e0b' : 'var(--text-3)' }, children: [charCount, "/", MAX_CHARS] }), _jsx("button", { onClick: handlePost, disabled: !newText.trim(), onFocus: () => screenReader.speak('Post comment'), onMouseEnter: () => screenReader.speak('Post comment'), style: {
                                    padding: '9px 20px',
                                    background: !newText.trim() ? 'var(--border)' : 'linear-gradient(135deg,#7c3aed,#2563eb)',
                                    color: !newText.trim() ? 'var(--text-3)' : 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: !newText.trim() ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                }, children: "Post \uD83D\uDE80" })] })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: comments.map(c => (_jsxs("div", { className: "card", style: { borderLeft: c.pinned ? '3px solid #7c3aed' : 'none' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: {
                                                width: 36,
                                                height: 36,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 18,
                                                flexShrink: 0,
                                            }, children: c.avatar }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }, children: c.author }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-3)' }, children: c.time })] })] }), c.tag && (_jsx("span", { style: {
                                        padding: '3px 10px',
                                        borderRadius: 20,
                                        background: 'rgba(124,58,237,0.08)',
                                        color: '#7c3aed',
                                        fontSize: 11,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                    }, children: c.tag }))] }), _jsx("p", { style: { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 12px' }, children: c.text }), _jsxs("button", { onClick: () => handleLike(c.id), onFocus: () => screenReader.speak(`Like comment by ${c.author}`), style: {
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 13,
                                color: c.likedByMe ? '#ef4444' : 'var(--text-3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                transition: 'all 0.15s',
                                padding: '4px 8px',
                                borderRadius: 8,
                            }, onMouseEnter: e => {
                                screenReader.speak(`Like comment by ${c.author}`);
                                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                            }, onMouseLeave: e => {
                                e.currentTarget.style.background = 'none';
                            }, children: [c.likedByMe ? '❤️' : '🤍', " ", c.likes] })] }, c.id))) })] }));
};
export default Community;
