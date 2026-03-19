/**
 * TOTP Authenticator - Background Service Worker
 */

// Al instalar la extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TOTP Authenticator instalado');
    chrome.storage.local.get(['accounts'], (result) => {
      if (!result.accounts) {
        chrome.storage.local.set({ accounts: [] });
      }
    });
  }
});

// Abrir side panel al hacer clic en el icono de la extension
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Configurar side panel para que se abra en todas las paginas
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Manejar mensajes del sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreen') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, (dataUrl) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
          } else {
            sendResponse({ dataUrl });
          }
        });
      } else {
        sendResponse({ error: 'No hay pestana activa' });
      }
    });
    return true; // Mantener el canal abierto para respuesta asincrona
  }
});
