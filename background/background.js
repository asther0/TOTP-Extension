/**
 * TOTP Authenticator Extension - Background Service Worker
 * Maneja eventos de instalación y actualizaciones
 */

// Escuchar instalación de la extensión
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TOTP Authenticator instalado correctamente');

    // Inicializar storage con array vacío si no existe
    chrome.storage.local.get(['accounts'], (result) => {
      if (!result.accounts) {
        chrome.storage.local.set({ accounts: [] }, () => {
          console.log('Storage inicializado');
        });
      }
    });
  } else if (details.reason === 'update') {
    console.log('TOTP Authenticator actualizado a versión ' + chrome.runtime.getManifest().version);
  }
});

// Mantener el service worker activo y manejar mensajes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ status: 'alive' });
  }

  // Abrir popup en nueva ventana cuando se solicita desde sidebar
  if (request.action === 'openPopup') {
    const popupUrl = chrome.runtime.getURL('popup/popup.html');
    chrome.windows.create({
      url: popupUrl,
      type: 'popup',
      width: 420,
      height: 600,
      focused: true
    });
    sendResponse({ status: 'opened' });
  }

  return true;
});
