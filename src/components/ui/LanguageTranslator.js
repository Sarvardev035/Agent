import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { GOOGLE_TRANSLATE_SCRIPT_URL } from '../../lib/config';
const INCLUDED_LANGUAGES = [
    'en', 'uz', 'ru', 'tr', 'ar', 'az', 'bg', 'bn', 'bs', 'ca', 'ceb', 'cs', 'cy',
    'da', 'de', 'el', 'eo', 'es', 'et', 'eu', 'fa', 'fi', 'fil', 'fr', 'ga', 'gl',
    'gu', 'ha', 'hi', 'hr', 'hu', 'hy', 'id', 'ig', 'is', 'it', 'iw', 'ja', 'jv',
    'ka', 'kk', 'km', 'kn', 'ko', 'ky', 'la', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk',
    'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'no', 'pa', 'pl', 'ps', 'pt',
    'ro', 'si', 'sk', 'sl', 'so', 'sq', 'sr', 'sv', 'sw', 'ta', 'te', 'tg', 'th',
    'tl', 'uk', 'ur', 'vi', 'xh', 'yo', 'zh-CN', 'zh-TW', 'zu',
].join(',');
const loadGoogleTranslate = () => {
    if (typeof window === 'undefined')
        return Promise.resolve();
    if (window.google?.translate?.TranslateElement)
        return Promise.resolve();
    if (window.__FINLY_GOOGLE_TRANSLATE_PROMISE__)
        return window.__FINLY_GOOGLE_TRANSLATE_PROMISE__;
    window.__FINLY_GOOGLE_TRANSLATE_PROMISE__ = new Promise(resolve => {
        window.finlyGoogleTranslateInit = () => resolve();
        const existing = document.querySelector('script[data-finly-google-translate="true"]');
        if (existing)
            return;
        const script = document.createElement('script');
        script.src = GOOGLE_TRANSLATE_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.dataset.finlyGoogleTranslate = 'true';
        script.onerror = () => resolve();
        document.body.appendChild(script);
    });
    return window.__FINLY_GOOGLE_TRANSLATE_PROMISE__;
};
const LanguageTranslator = ({ compact = false }) => {
    const [ready, setReady] = useState(false);
    const containerIdRef = useRef(`finly_translate_${Math.random().toString(36).slice(2, 10)}`);
    useEffect(() => {
        let cancelled = false;
        loadGoogleTranslate().then(() => {
            if (cancelled)
                return;
            const element = document.getElementById(containerIdRef.current);
            if (!element || !window.google?.translate?.TranslateElement)
                return;
            element.innerHTML = '';
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false,
                includedLanguages: INCLUDED_LANGUAGES,
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            }, containerIdRef.current);
            setReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    return (_jsxs("div", { className: `finly-translate${compact ? ' is-compact' : ''}`, children: [_jsx("div", { id: containerIdRef.current }), !ready && (_jsx("span", { className: "finly-translate__loading", children: "Loading languages..." }))] }));
};
export default LanguageTranslator;
