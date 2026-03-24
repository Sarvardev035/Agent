const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (!value) return fallback
  const normalized = value.trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on'
}

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://finly.uyqidir.uz').replace(/\/+$/, '')

export const USE_API_CREDENTIALS = parseBoolean(import.meta.env.VITE_USE_API_CREDENTIALS, false)

export const GOOGLE_TRANSLATE_SCRIPT_URL =
  'https://translate.google.com/translate_a/element.js?cb=finlyGoogleTranslateInit'
