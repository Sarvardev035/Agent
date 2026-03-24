import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { screenReader } from '../lib/screenReader';
const NOTE_COLORS = ['#fef3c7', '#fce7f3', '#ede9fe', '#dbeafe', '#d1fae5', '#fef2f2'];
const NOTES_KEY = 'finly_notes';
const loadNotes = () => {
    try {
        const s = localStorage.getItem(NOTES_KEY);
        return s ? JSON.parse(s) : [];
    }
    catch {
        return [];
    }
};
const saveNotes = (notes) => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};
const dayLabel = (isoDate) => {
    const noteDate = new Date(isoDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const toDayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const key = toDayKey(noteDate);
    if (key === toDayKey(today))
        return 'Today';
    if (key === toDayKey(yesterday))
        return 'Yesterday';
    return noteDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};
const Notes = () => {
    const [notes, setNotes] = useState(loadNotes);
    const [active, setActive] = useState(null);
    const [search, setSearch] = useState('');
    const [isPhone, setIsPhone] = useState(() => window.matchMedia('(max-width: 768px)').matches);
    const [saveStatus, setSaveStatus] = useState('idle');
    const autoSaveRef = useRef(null);
    useEffect(() => {
        const media = window.matchMedia('(max-width: 768px)');
        const onChange = (e) => setIsPhone(e.matches);
        if (media.addEventListener) {
            media.addEventListener('change', onChange);
            return () => media.removeEventListener('change', onChange);
        }
        media.addListener(onChange);
        return () => media.removeListener(onChange);
    }, []);
    const persistNote = (noteToPersist, announce = false) => {
        const persisted = {
            ...noteToPersist,
            updatedAt: new Date().toISOString(),
        };
        setSaveStatus('saving');
        setNotes(prev => {
            const updated = prev.map(n => (n.id === persisted.id ? persisted : n));
            saveNotes(updated);
            return updated;
        });
        setActive(prev => (prev && prev.id === persisted.id ? persisted : prev));
        setSaveStatus('saved');
        if (announce)
            screenReader.speak('Note saved', true);
        window.setTimeout(() => setSaveStatus('idle'), 1000);
    };
    useEffect(() => {
        if (!active)
            return;
        if (autoSaveRef.current)
            clearTimeout(autoSaveRef.current);
        autoSaveRef.current = setTimeout(() => {
            persistNote(active);
        }, 500);
        return () => {
            if (autoSaveRef.current)
                clearTimeout(autoSaveRef.current);
        };
    }, [active?.title, active?.body]);
    const createNote = () => {
        const note = {
            id: `note_${Date.now()}`,
            title: '',
            body: '',
            color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pinned: false,
        };
        const updated = [note, ...notes];
        setNotes(updated);
        saveNotes(updated);
        setActive(note);
        screenReader.speak('New note created', true);
    };
    const deleteNote = (id) => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        saveNotes(updated);
        if (active?.id === id)
            setActive(null);
        screenReader.speak('Note deleted', true);
    };
    const exportNote = (note) => {
        const content = `${note.title || 'Untitled'}\n` +
            `${'-'.repeat(40)}\n` +
            `${note.body}\n\n` +
            `Created: ${new Date(note.createdAt).toLocaleString()}\n` +
            `Updated: ${new Date(note.updatedAt).toLocaleString()}\n` +
            `- Finly Personal Finance`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title || 'note'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        screenReader.speak('Note exported', true);
    };
    const shareNote = async (note) => {
        const text = `${note.title}\n\n${note.body}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: note.title || 'My Finly Note',
                    text,
                });
                screenReader.speak('Note shared', true);
            }
            catch { }
        }
        else {
            await navigator.clipboard.writeText(text);
            alert('Note copied to clipboard!');
            screenReader.speak('Note copied to clipboard', true);
        }
    };
    const togglePin = (id) => {
        const updated = notes.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n));
        setNotes(updated);
        saveNotes(updated);
    };
    const filtered = useMemo(() => notes
        .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [notes, search]);
    const calendarSections = useMemo(() => {
        const grouped = new Map();
        filtered.forEach(note => {
            const label = dayLabel(note.updatedAt);
            if (!grouped.has(label))
                grouped.set(label, []);
            grouped.get(label).push(note);
        });
        return Array.from(grouped.entries()).map(([label, sectionNotes]) => ({
            label,
            notes: sectionNotes,
        }));
    }, [filtered]);
    return (_jsxs("div", { className: "page-content", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: 'var(--text-1)', margin: 0 }, children: "Notes \uD83D\uDCDD" }), _jsxs("p", { style: { fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0' }, children: [notes.length, " note", notes.length !== 1 ? 's' : '', " \u00B7 Auto-saved locally"] })] }), _jsx("button", { onClick: createNote, onFocus: () => screenReader.speak('Create new note'), onMouseEnter: () => screenReader.speak('Create new note'), style: {
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }, children: "+ New Note" })] }), _jsx("input", { value: search, onChange: e => setSearch(e.target.value), onFocus: () => screenReader.speak('Search notes input'), placeholder: "Search notes...", style: {
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
                } }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: active ? (isPhone ? '1fr' : '320px 1fr') : '1fr',
                    gap: 16,
                }, children: [_jsx("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            order: isPhone && active ? 2 : 1,
                        }, children: filtered.length === 0 ? (_jsxs("div", { style: { textAlign: 'center', padding: 40, color: 'var(--text-3)' }, children: [_jsx("div", { style: { fontSize: 40, marginBottom: 12 }, children: "\uD83D\uDCDD" }), _jsx("p", { children: "No notes yet. Create your first one!" })] })) : (calendarSections.map(section => (_jsxs("div", { style: { display: 'grid', gap: 8 }, children: [_jsx("div", { style: {
                                        fontSize: 11,
                                        fontWeight: 800,
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        color: 'var(--text-3)',
                                        padding: '4px 4px 0',
                                    }, children: section.label }), section.notes.map(note => (_jsxs("div", { onClick: () => setActive(note), style: {
                                        background: note.color,
                                        borderRadius: 14,
                                        padding: 12,
                                        cursor: 'pointer',
                                        border: active?.id === note.id ? '2px solid #7c3aed' : '1px solid rgba(148,163,184,0.18)',
                                        transition: 'all 0.15s',
                                        position: 'relative',
                                    }, onMouseEnter: e => {
                                        e.currentTarget.style.transform = 'translateX(3px)';
                                        screenReader.speak(`Open note ${note.title || 'Untitled'}`);
                                    }, onMouseLeave: e => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }, children: [note.pinned && (_jsx("span", { style: { position: 'absolute', top: 8, right: 8, fontSize: 12 }, children: "\uD83D\uDCCC" })), _jsx("div", { style: {
                                                fontWeight: 700,
                                                fontSize: 14,
                                                color: '#1e293b',
                                                marginBottom: 4,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                paddingRight: 20,
                                            }, children: note.title || 'Untitled' }), _jsx("div", { style: {
                                                fontSize: 12,
                                                color: '#475569',
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                lineHeight: 1.4,
                                            }, children: note.body || 'Empty note...' }), _jsx("div", { style: { fontSize: 10, color: '#64748b', marginTop: 8 }, children: new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }, note.id)))] }, section.label)))) }), active && (_jsxs("div", { className: "card", style: {
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 400,
                            order: isPhone ? 1 : 2,
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }, children: [_jsxs("div", { style: { fontSize: 11, color: 'var(--text-3)' }, children: [saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Auto-save ready', _jsx("span", { style: { marginLeft: 6 }, children: "\uD83D\uDCBE" })] }), _jsxs("div", { style: { display: 'flex', gap: 6 }, children: [isPhone && (_jsx("button", { onClick: () => setActive(null), style: {
                                                    background: 'none',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 8,
                                                    padding: '4px 10px',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    color: 'var(--text-2)',
                                                }, children: "\u2190 Back" })), _jsx("button", { onClick: () => togglePin(active.id), style: {
                                                    background: 'none',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 8,
                                                    padding: '4px 10px',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    color: 'var(--text-2)',
                                                }, children: active.pinned ? '📌 Unpin' : '📌 Pin' }), _jsx("button", { onClick: () => exportNote(active), style: {
                                                    background: 'none',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 8,
                                                    padding: '4px 10px',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    color: 'var(--text-2)',
                                                }, children: "\u2B07 Export" }), _jsx("button", { onClick: () => shareNote(active), style: {
                                                    background: 'none',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 8,
                                                    padding: '4px 10px',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    color: 'var(--text-2)',
                                                }, children: "\uD83D\uDCE4 Share" }), _jsx("button", { onClick: () => deleteNote(active.id), style: {
                                                    background: 'none',
                                                    border: '1px solid rgba(239,68,68,0.3)',
                                                    borderRadius: 8,
                                                    padding: '4px 10px',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    color: '#ef4444',
                                                }, children: "\uD83D\uDDD1" })] })] }), _jsx("input", { value: active.title, onChange: e => setActive(p => (p ? { ...p, title: e.target.value } : p)), onKeyDown: e => {
                                    if (e.key === 'Enter' || e.key === 'Tab') {
                                        persistNote(active, true);
                                    }
                                }, placeholder: "Note title...", style: {
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: 'var(--text-1)',
                                    background: 'transparent',
                                    marginBottom: 10,
                                    width: '100%',
                                    fontFamily: 'inherit',
                                } }), _jsx("textarea", { value: active.body, onChange: e => setActive(p => (p ? { ...p, body: e.target.value } : p)), onKeyDown: e => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        persistNote(active, true);
                                    }
                                }, placeholder: `Start writing your note...

💡 Ideas:
- Monthly savings goals
- Budget planning notes
- Expense review reminders
- Financial targets

⌨️ Save shortcut: Ctrl/Cmd + Enter`, style: {
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
                                } }), _jsxs("div", { style: { fontSize: 11, color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }, children: [active.body.split(' ').filter(Boolean).length, " words \u00B7 ", active.body.length, " characters \u00B7 Saved locally on your device"] }), _jsx("button", { type: "button", onClick: () => persistNote(active, true), style: {
                                    position: 'sticky',
                                    alignSelf: 'flex-end',
                                    bottom: 12,
                                    marginTop: 12,
                                    padding: '10px 16px',
                                    border: 'none',
                                    borderRadius: 12,
                                    background: 'linear-gradient(135deg,#2563eb,#14b8a6)',
                                    color: '#fff',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 24px rgba(37,99,235,0.28)',
                                }, children: "Save Note" })] }))] })] }));
};
export default Notes;
