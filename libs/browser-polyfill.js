/**
 * Browser API Polyfill
 * Provides cross-browser compatibility for Chrome and Safari
 */

(function() {
  'use strict';

  // Detect browser
  const isChrome = typeof chrome !== 'undefined' && !!chrome.runtime;
  const isSafari = typeof safari !== 'undefined' ||
    (typeof browser !== 'undefined' && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'));

  // Create unified API
  if (typeof globalThis.browserAPI === 'undefined') {
    globalThis.browserAPI = (function() {
      // Use browser (Firefox/Safari) or chrome
      const api = typeof browser !== 'undefined' ? browser : chrome;

      // Promisify chrome callbacks for consistency
      function promisify(fn) {
        return function(...args) {
          return new Promise((resolve, reject) => {
            fn(...args, (result) => {
              if (api.runtime && api.runtime.lastError) {
                reject(new Error(api.runtime.lastError.message));
              } else {
                resolve(result);
              }
            });
          });
        };
      }

      return {
        // Storage API
        storage: {
          local: {
            get: function(keys) {
              if (api.storage.local.get.length === 1) {
                // Promise-based (Firefox/Safari)
                return api.storage.local.get(keys);
              }
              // Callback-based (Chrome)
              return promisify(api.storage.local.get.bind(api.storage.local))(keys);
            },
            set: function(items) {
              if (api.storage.local.set.length === 1) {
                return api.storage.local.set(items);
              }
              return promisify(api.storage.local.set.bind(api.storage.local))(items);
            }
          },
          onChanged: api.storage.onChanged
        },

        // Runtime API
        runtime: {
          sendMessage: function(message) {
            if (api.runtime.sendMessage.length === 1) {
              return api.runtime.sendMessage(message);
            }
            return promisify(api.runtime.sendMessage.bind(api.runtime))(message);
          },
          onMessage: api.runtime.onMessage,
          onInstalled: api.runtime.onInstalled,
          lastError: api.runtime.lastError,
          getURL: api.runtime.getURL ? api.runtime.getURL.bind(api.runtime) : null
        },

        // Tabs API
        tabs: api.tabs ? {
          query: function(queryInfo) {
            if (api.tabs.query.length === 1) {
              return api.tabs.query(queryInfo);
            }
            return promisify(api.tabs.query.bind(api.tabs))(queryInfo);
          },
          captureVisibleTab: api.tabs.captureVisibleTab ? function(windowId, options) {
            if (api.tabs.captureVisibleTab.length === 2) {
              return api.tabs.captureVisibleTab(windowId, options);
            }
            return promisify(api.tabs.captureVisibleTab.bind(api.tabs))(windowId, options);
          } : null
        } : null,

        // Action API (for toolbar icon)
        action: api.action || api.browserAction || null,

        // Side Panel API (Chrome only)
        sidePanel: api.sidePanel || null,

        // Browser detection
        isChrome: isChrome,
        isSafari: isSafari,
        hasSidePanel: !!api.sidePanel
      };
    })();
  }
})();
