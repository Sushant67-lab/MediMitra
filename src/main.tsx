import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

declare global {
  interface Window {
    __MEDIMITRA_MOUNTED__?: boolean;
  }
}

const rootEl = document.getElementById('root')!;
createRoot(rootEl).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
window.__MEDIMITRA_MOUNTED__ = true;
