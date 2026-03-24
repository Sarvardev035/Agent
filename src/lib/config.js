const parseBoolean = (value, fallback = false) => {
    if (!value)
        return fallback;
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
};
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://finly.uyqidir.uz').replace(/\/+$/, '');
export const USE_API_CREDENTIALS = parseBoolean(import.meta.env.VITE_USE_API_CREDENTIALS, false);
export const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || '';
export const AI_API_BASE_URL = (import.meta.env.VITE_AI_API_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
export const AI_MODEL = import.meta.env.VITE_AI_MODEL || 'llama-3.1-8b-instant';
export const GOOGLE_TRANSLATE_SCRIPT_URL = 'https://translate.google.com/translate_a/element.js?cb=finlyGoogleTranslateInit';
