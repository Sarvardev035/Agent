import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { categoriesService } from '../services/categories.service';
import { safeArray } from '../lib/helpers';
const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeType, setActiveType] = useState('EXPENSE');
    const [showModal, setShowModal] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [form, setForm] = useState({ name: '' });
    const loadCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoriesService.getByType(activeType);
            setCategories(safeArray(res.data));
        }
        catch (err) {
            setError(err.message || 'Failed to load categories');
            toast.error(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadCategories();
    }, [activeType]);
    const filteredCategories = categories.filter(c => c.type === activeType);
    const handleAdd = async () => {
        if (!form.name.trim()) {
            toast.error('Category name is required');
            return;
        }
        try {
            await categoriesService.create({
                name: form.name.trim(),
                type: activeType,
            });
            toast.success('Category added!');
            setShowModal(false);
            setForm({ name: '' });
            await loadCategories();
        }
        catch (err) {
            toast.error(err.message || 'Failed to add category');
        }
    };
    const handleDelete = async (id) => {
        try {
            // Note: categoriesService doesn't have a delete method yet
            // This would need to be added to the service
            // For now, we'll just show a message
            toast.error('Delete not yet implemented in backend');
        }
        catch (err) {
            toast.error(err.message || 'Failed to delete');
        }
    };
    return (_jsxs("div", { className: "page-enter", style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("p", { style: { color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }, children: "CATEGORIES" }), _jsx("h1", { style: { margin: '4px 0', fontSize: 22, fontWeight: 800 }, children: "Manage categories" }), _jsx("p", { style: { margin: 0, color: 'var(--text-2)' }, children: "Organize your spending and income." })] }), _jsxs("button", { onClick: () => setShowModal(true), type: "button", style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            border: 'none',
                            background: '#7c3aed',
                            color: '#fff',
                            padding: '10px 12px',
                            borderRadius: 12,
                            fontWeight: 800,
                            boxShadow: '0 12px 30px rgba(124,58,237,0.3)',
                            cursor: 'pointer',
                        }, children: [_jsx(Plus, { size: 16 }), " Add category"] })] }), _jsx("div", { style: { display: 'flex', gap: 10 }, children: ['EXPENSE', 'INCOME'].map(type => (_jsx("button", { onClick: () => setActiveType(type), type: "button", style: {
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: activeType === type ? '1px solid #7c3aed' : '1px solid var(--border)',
                        background: activeType === type ? 'rgba(124,58,237,0.12)' : 'var(--surface)',
                        color: activeType === type ? '#7c3aed' : 'var(--text-1)',
                        fontWeight: 700,
                    }, children: type === 'EXPENSE' ? 'Expenses' : 'Income' }, type))) }), _jsx("div", { style: {
                    background: 'var(--surface-strong)',
                    borderRadius: 16,
                    padding: 16,
                    boxShadow: 'var(--shadow-sm)',
                    minHeight: 240,
                    border: '1px solid var(--border)',
                }, children: loading ? (_jsx(Skeleton, { height: 64, count: 4 })) : filteredCategories.length === 0 ? (_jsx(EmptyState, { title: "No categories", description: `Add your first ${activeType === 'EXPENSE' ? 'expense' : 'income'} category.`, actionLabel: "Add", onAction: () => setShowModal(true) })) : (_jsx(AnimatePresence, { children: _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }, children: filteredCategories.map(cat => (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -20 }, style: {
                                background: 'var(--surface)',
                                borderRadius: 12,
                                padding: 12,
                                border: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }, children: [_jsx("p", { style: { margin: 0, fontWeight: 700, color: 'var(--text-1)' }, children: cat.name }), _jsxs("button", { onClick: () => setConfirmId(cat.id), type: "button", style: {
                                        marginTop: 8,
                                        border: '1px solid #ffe4e6',
                                        background: '#fff1f2',
                                        color: '#ef4444',
                                        borderRadius: 8,
                                        padding: '6px 8px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 4,
                                        fontWeight: 700,
                                        fontSize: 12,
                                    }, children: [_jsx(Trash2, { size: 14 }), " Delete"] })] }, cat.id))) }) })) }), _jsx(Modal, { open: showModal, onClose: () => setShowModal(false), title: "Add category", children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontWeight: 700, fontSize: 13 }, children: "Category name" }), _jsx("input", { type: "text", value: form.name, placeholder: "e.g., Groceries", onChange: e => setForm({ ...form, name: e.target.value }), style: { width: '100%', border: '1px solid var(--border)', borderRadius: 10, padding: 10, background: 'var(--surface)', color: 'var(--text-1)' } })] }), _jsx("button", { onClick: handleAdd, type: "button", style: {
                                background: '#7c3aed',
                                color: '#fff',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: 10,
                                fontWeight: 800,
                                cursor: 'pointer',
                            }, children: "Add category" })] }) }), _jsx(ConfirmDialog, { open: confirmId !== null, title: "Delete category", message: "Are you sure? This cannot be undone.", onConfirm: () => {
                    if (confirmId) {
                        handleDelete(confirmId);
                        setConfirmId(null);
                    }
                }, onCancel: () => setConfirmId(null) })] }));
};
export default Categories;
