/**
 * TOTP Authenticator - Background Service Worker
 * Cross-browser compatible (Chrome, Safari, Firefox)
 */

// Check side panel support
const hasSidePanel = typeof chrome !== 'undefined' && typeof chrome.sidePanel !== 'undefined';

// On install - initialize storage and configure side panel
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TOTP Authenticator instalado');
    chrome.storage.local.get(['accounts'], (result) => {
      if (!result.accounts) {
        chrome.storage.local.set({ accounts: [] });
      }
    });
  }

  // Configure side panel behavior after install (SW is ready)
  if (hasSidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
      console.warn('Side panel behavior config:', error.message);
    });
  }
});

// Handle action click - Open side panel automatically
if (hasSidePanel) {
  chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch((error) => {
      console.error('Error opening side panel:', error);
    });
  });
}

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
