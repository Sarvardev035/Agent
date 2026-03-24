import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Trash2, Users } from 'lucide-react';
import { familyStorageService } from '../../services/family-storage.service';
import AddFamilyMemberModal from './AddFamilyMemberModal';
export const FamilyShareModal = ({ isOpen, onClose }) => {
    const [members, setMembers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const loadMembers = () => {
        const all = familyStorageService.getAll();
        setMembers(all);
    };
    useEffect(() => {
        if (isOpen) {
            loadMembers();
        }
    }, [isOpen]);
    const handleCreate = async (payload) => {
        const name = payload.name.trim();
        const email = payload.email.trim().toLowerCase();
        if (!name || !email || !payload.password) {
            setError('Please fill Username, Gmail address, and Password.');
            return;
        }
        if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
            setError('Please use a valid Gmail address.');
            return;
        }
        if (payload.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
            setError('This Gmail account is already in your family.');
            return;
        }
        setCreating(true);
        setError('');
        try {
            const newMember = familyStorageService.add({
                name,
                email,
                role: 'EDITOR',
            });
            setMembers(prev => [...prev, newMember]);
            setShowAddModal(false);
            setNotice('Family member account created successfully.');
            setTimeout(() => setNotice(''), 3000);
        }
        catch {
            setError('Could not create account. Please try again.');
        }
        finally {
            setCreating(false);
        }
    };
    const handleRemove = (id) => {
        try {
            familyStorageService.remove(id);
            setMembers(prev => prev.filter(m => m.id !== id));
            setNotice('Family member removed.');
            setTimeout(() => setNotice(''), 2000);
        }
        catch {
            setError('Could not remove member.');
        }
    };
    const handleRoleChange = (id, newRole) => {
        try {
            familyStorageService.update(id, { role: newRole });
            setMembers(prev => prev.map(m => (m.id === id ? { ...m, role: newRole } : m)));
            setNotice('Permissions updated.');
            setTimeout(() => setNotice(''), 2000);
        }
        catch {
            setError('Could not update permissions.');
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { onClick: e => {
            if (e.target === e.currentTarget)
                onClose();
        }, style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(2,6,23,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
        }, children: [_jsxs("div", { style: {
                    width: 'min(560px, 100%)',
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-strong)',
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--border)',
                            flexShrink: 0,
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: { fontSize: 20 }, children: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66" }), _jsx("h2", { style: { margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }, children: "Family Sharing" })] }), _jsx("button", { type: "button", "data-button-reset": "true", onClick: onClose, style: {
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
                                }, children: _jsx(X, { size: 18 }) })] }), _jsxs("div", { style: { flex: 1, overflowY: 'auto', padding: '24px' }, children: [_jsxs("div", { style: {
                                    marginBottom: 18,
                                    borderRadius: 12,
                                    border: '1px solid rgba(148,163,184,0.22)',
                                    background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.08))',
                                    padding: 14,
                                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }, children: "Invite and create account" }), _jsx("div", { style: { fontSize: 12, color: 'var(--text-2)' }, children: "Add a family member to track or edit shared finances." })] }), _jsx("button", { type: "button", "data-button-reset": "true", onClick: () => {
                                                    setError('');
                                                    setShowAddModal(true);
                                                }, style: {
                                                    padding: '9px 12px',
                                                    borderRadius: 9,
                                                    border: '1px solid rgba(52,211,153,0.38)',
                                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.24), rgba(56,189,248,0.22))',
                                                    color: '#ccfbf1',
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                }, children: "+ Add to family" })] }), error && _jsx("div", { style: { marginTop: 10, fontSize: 12, color: '#fda4af' }, children: error }), notice && _jsx("div", { style: { marginTop: 10, fontSize: 12, color: '#86efac' }, children: notice })] }), _jsxs("div", { children: [_jsxs("h3", { style: { margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }, children: [_jsx(Users, { size: 16, style: { display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' } }), "Family members (", members.length, ")"] }), members.length === 0 ? (_jsx("div", { style: {
                                            textAlign: 'center',
                                            padding: '24px 16px',
                                            borderRadius: 8,
                                            background: 'rgba(226,232,240,0.05)',
                                            color: 'var(--text-3)',
                                            fontSize: 13,
                                        }, children: "No family members yet \u2014 add one above to get started." })) : (_jsx("div", { style: { display: 'grid', gap: 8 }, children: members.map(member => (_jsxs("div", { style: {
                                                borderRadius: 8,
                                                border: '1px solid rgba(148,163,184,0.22)',
                                                background: 'rgba(15,23,42,0.5)',
                                                padding: 12,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 10,
                                            }, children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }, children: member.name }), _jsx("div", { style: {
                                                                fontSize: 11,
                                                                color: 'var(--text-3)',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }, children: member.email })] }), _jsxs("div", { style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end',
                                                        gap: 8,
                                                        flexWrap: 'wrap',
                                                        width: '100%',
                                                    }, children: [_jsxs("select", { value: member.role, onChange: e => handleRoleChange(member.id, e.target.value === 'VIEWER' ? 'VIEWER' : 'EDITOR'), style: {
                                                                padding: '6px 8px',
                                                                borderRadius: 6,
                                                                border: '1px solid rgba(148,163,184,0.3)',
                                                                background: 'rgba(15,23,42,0.8)',
                                                                color: '#e2e8f0',
                                                                fontSize: 11,
                                                                outline: 'none',
                                                                minWidth: 100,
                                                            }, children: [_jsx("option", { value: "EDITOR", children: "Editor" }), _jsx("option", { value: "VIEWER", children: "Viewer" })] }), _jsx("button", { type: "button", "data-button-reset": "true", onClick: () => handleRemove(member.id), style: {
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
                                                            }, children: _jsx(Trash2, { size: 16 }) })] })] }, member.id))) })), _jsx("p", { style: {
                                            marginTop: 16,
                                            fontSize: 11,
                                            color: 'var(--text-3)',
                                            lineHeight: 1.5,
                                        }, children: "Data is saved locally on your device. Family members will see shared transactions and accounts based on their role." })] })] })] }), _jsx(AddFamilyMemberModal, { isOpen: showAddModal, isSubmitting: creating, onClose: () => {
                    if (creating)
                        return;
                    setShowAddModal(false);
                }, onSubmit: handleCreate })] }));
};
