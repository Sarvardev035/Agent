import { isAxiosError } from 'axios';
import api, { unwrap } from '../lib/api';
const asRecord = (value) => value && typeof value === 'object' ? value : {};
const asNumber = (...values) => {
    for (const value of values) {
        const numberValue = typeof value === 'string' ? Number(value) : value;
        if (typeof numberValue === 'number' && Number.isFinite(numberValue))
            return numberValue;
    }
    return null;
};
const asString = (...values) => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim())
            return value.trim();
    }
    return '';
};
const asArray = (value) => {
    if (Array.isArray(value))
        return value;
    const root = asRecord(value);
    if (Array.isArray(root.data))
        return root.data;
    if (Array.isArray(root.items))
        return root.items;
    if (Array.isArray(root.members))
        return root.members;
    if (Array.isArray(root.content))
        return root.content;
    return [];
};
const shouldTryNextEndpoint = (error) => {
    if (!isAxiosError(error))
        return false;
    const status = error.response?.status;
    return status === 404 || status === 405 || status === 501;
};
const requestFromCandidates = async (requests, parse) => {
    let lastError = null;
    for (const request of requests) {
        try {
            const response = await request();
            return parse(response);
        }
        catch (error) {
            lastError = error;
            if (!shouldTryNextEndpoint(error))
                break;
        }
    }
    throw lastError ?? new Error('Request failed');
};
const parseSessionSummary = (response) => {
    const payload = asRecord(unwrap(response));
    const activeUsers = asNumber(payload.activeUsers, payload.activeUsersCount, payload.onlineUsers, payload.onlineUserCount, payload.currentUsers, payload.totalUsers);
    const activeSessions = asNumber(payload.activeSessions, payload.sessionCount, payload.activeSessionCount, payload.currentSessions);
    return { activeUsers, activeSessions };
};
const parseFamilyMembers = (response) => {
    const payload = unwrap(response);
    const items = asArray(payload);
    return items.map(item => {
        const record = asRecord(item);
        return {
            id: asString(record.id, record.memberId, record.userId) || crypto.randomUUID(),
            name: asString(record.name, record.fullName, record.displayName) || 'Family member',
            email: asString(record.email, record.username),
            role: asString(record.role).toUpperCase() || 'VIEWER',
            status: asString(record.status).toUpperCase() || 'ACTIVE',
        };
    });
};
export const settingsService = {
    getSessionSummary: async () => {
        try {
            return await requestFromCandidates([
                () => api.get('/api/sessions/summary'),
                () => api.get('/api/sessions/active-users'),
                () => api.get('/api/analytics/active-users'),
                () => api.get('/api/users/sessions/summary'),
            ], parseSessionSummary);
        }
        catch {
            return { activeUsers: null, activeSessions: null };
        }
    },
    listFamilyMembers: async () => {
        try {
            return await requestFromCandidates([
                () => api.get('/api/family/members'),
                () => api.get('/api/users/family-members'),
                () => api.get('/api/sharing/family-members'),
            ], parseFamilyMembers);
        }
        catch {
            return [];
        }
    },
    createFamilyMember: async (payload) => {
        await requestFromCandidates([
            () => api.post('/api/family/members', payload),
            () => api.post('/api/users/family-members', payload),
            () => api.post('/api/sharing/family-members', payload),
        ], () => undefined);
    },
};
