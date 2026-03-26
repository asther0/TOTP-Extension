/**
 * TOTP Authenticator - Background Service Worker
 * Cross-browser compatible (Chrome, Safari, Firefox)
 */

// Use chrome API directly (standard for Manifest V3)
const browserAPI = chrome;
const hasSidePanel = typeof chrome.sidePanel !== 'undefined';

// On install
browserAPI.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TOTP Authenticator instalado');
    browserAPI.storage.local.get(['accounts'], (result) => {
      if (!result.accounts) {
        browserAPI.storage.local.set({ accounts: [] });
      }
    });
  }
});

// Handle action click - Chrome with SidePanel vs Safari/Firefox with popup
if (hasSidePanel) {
  // Chrome: Configure side panel to open on action click
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
    console.error('Error setting side panel behavior:', error);
  });
}
// Note: For Safari/Firefox, the popup is configured in manifest.json

// Handle messages from popup/sidepanel
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreen') {
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        browserAPI.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, (dataUrl) => {
          const lastError = browserAPI.runtime.lastError;
          if (lastError) {
            sendResponse({ error: lastError.message });
          } else {
            sendResponse({ dataUrl });
          }
        });
      } else {
        sendResponse({ error: 'No hay pestana activa' });
      }
    });
    return true; // Keep channel open for async response
  }
});
