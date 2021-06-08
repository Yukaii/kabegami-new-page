if (typeof window.browser === 'undefined') {
  window.browser = require('webextension-polyfill');
}

if (typeof (window as any).chrome === 'undefined') {
  (window as any).chrome = window.browser;
}
