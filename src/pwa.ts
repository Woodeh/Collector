const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      const checkForUpdate = () => registration.update().catch(() => undefined);
      window.addEventListener('online', checkForUpdate);
      window.setInterval(checkForUpdate, 60 * 60 * 1000);
    }).catch((error: unknown) => {
      console.warn('Service worker registration failed:', error);
    });
  });
};

registerServiceWorker();
