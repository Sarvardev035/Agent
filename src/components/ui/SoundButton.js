import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { sounds } from '../../lib/sounds';
export const SoundButton = () => {
    const [muted, setMuted] = useState(() => sounds.getMuted());
    const toggle = () => {
        const nowMuted = sounds.toggleMute();
        setMuted(nowMuted);
    };
    return (_jsx("button", { onClick: toggle, title: muted ? 'Enable sounds' : 'Mute sounds', type: "button", "data-button-reset": "true", style: {
            width: 36,
            height: 36,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            transition: 'all 0.2s ease',
            color: 'var(--text-2)',
            flexShrink: 0,
        }, onMouseEnter: e => {
            e.currentTarget.style.background = 'rgba(124,58,237,0.15)';
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
            e.currentTarget.style.transform = 'scale(1.1)';
        }, onMouseLeave: e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.transform = 'scale(1)';
        }, onMouseDown: e => {
            e.currentTarget.style.transform = 'scale(0.95)';
        }, onMouseUp: e => {
            e.currentTarget.style.transform = 'scale(1.1)';
        }, children: muted ? '🔇' : '🔊' }));
};
