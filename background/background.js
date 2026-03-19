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
