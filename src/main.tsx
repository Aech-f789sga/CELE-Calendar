import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Auto-register service worker for automatic background updates
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      // Periodically check for deployed updates
      setInterval(() => {
        registration.update().catch(() => {});
      }, 30 * 60 * 1000);

      // Check for updates when app is opened or resumed on Android
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    }
  },
  onOfflineReady() {
    console.log('Chronos Flow cached and ready for offline use');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
