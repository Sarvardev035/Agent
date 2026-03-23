export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'https://finly.uyqidir.uz').replace(/\/+$/, '')

export const GOOGLE_TRANSLATE_SCRIPT_URL =
  'https://translate.google.com/translate_a/element.js?cb=finlyGoogleTranslateInit'
