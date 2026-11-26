import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { getState, player, setState } from './store';

if (import.meta.env.DEV) window.__sz = { getState, setState, player };

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
