const FAMILY_MEMBERS_KEY = 'finly_family_members';
export const familyStorageService = {
    getAll: () => {
        if (typeof window === 'undefined')
            return [];
        try {
            const stored = window.localStorage.getItem(FAMILY_MEMBERS_KEY);
            return stored ? JSON.parse(stored) : [];
        }
        catch {
            return [];
        }
    },
    add: (member) => {
        if (typeof window === 'undefined')
            throw new Error('Storage unavailable');
        const newMember = {
            ...member,
            id: crypto.randomUUID(),
            addedAt: new Date().toISOString(),
        };
        const all = familyStorageService.getAll();
        const updated = [...all, newMember];
        window.localStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(updated));
        return newMember;
    },
    remove: (id) => {
        if (typeof window === 'undefined')
            return;
        const all = familyStorageService.getAll();
        const updated = all.filter(m => m.id !== id);
        window.localStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(updated));
    },
    update: (id, updates) => {
        if (typeof window === 'undefined')
            return;
        const all = familyStorageService.getAll();
        const updated = all.map(m => (m.id === id ? { ...m, ...updates } : m));
        window.localStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(updated));
    },
};
