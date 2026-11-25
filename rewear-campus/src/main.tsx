import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';
import { registerSW } from './lib/pwa';

try {
  const t = localStorage.getItem('rewear-theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch { /* storage unavailable */ }

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
registerSW();
