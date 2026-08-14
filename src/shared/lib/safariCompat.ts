const userAgent = navigator.userAgent;
const isIPadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || isIPadDesktopMode;
const isWebKit = /AppleWebKit/i.test(userAgent);
const isAlternativeIOSBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(userAgent);

if (isIOS && isWebKit && !isAlternativeIOSBrowser) {
  document.documentElement.classList.add('ios-safari');

  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && navigator.standalone === true);

  if (standalone) document.documentElement.classList.add('ios-standalone');
}
