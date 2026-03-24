import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const initialStatus = {
    offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    slow: false,
    backendError: false,
    message: '',
};
const NetworkStatus = () => {
    const [status, setStatus] = useState(initialStatus);
    useEffect(() => {
        const handleStatus = (event) => {
            const customEvent = event;
            if (customEvent.detail)
                setStatus(customEvent.detail);
        };
        window.addEventListener('finly:network-status', handleStatus);
        return () => window.removeEventListener('finly:network-status', handleStatus);
    }, []);
    if (!status.offline && !status.slow && !status.backendError)
        return null;
    const title = status.offline
        ? 'Internet connection lost'
        : status.backendError
            ? 'Backend is not responding'
            : 'Connection is slower than usual';
    const description = status.message
        || (status.offline
            ? 'We will reconnect automatically when your internet comes back.'
            : 'Please wait a moment while Finly syncs with the server.');
    return (_jsxs("div", { className: `network-status${status.offline ? ' is-offline' : ''}${status.backendError ? ' is-error' : ''}${status.slow ? ' is-slow' : ''}`, role: "status", "aria-live": "polite", children: [_jsxs("div", { className: "network-status__loader", "aria-hidden": "true", children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }), _jsxs("div", { className: "network-status__copy", children: [_jsx("strong", { children: title }), _jsx("span", { children: description })] })] }));
};
export default NetworkStatus;
