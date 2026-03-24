import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FinanceProvider } from './context/FinanceContext';
import { initAccessibility } from './lib/screenReader';
initAccessibility();
const root = document.getElementById('root');
if (!root)
    throw new Error('No root element found');
ReactDOM.createRoot(root).render(_jsx(React.StrictMode, { children: _jsx(ErrorBoundary, { children: _jsx(FinanceProvider, { children: _jsx(App, {}) }) }) }));
