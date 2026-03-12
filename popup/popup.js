/**
 * TOTP Authenticator Extension - Popup Logic
 * Maneja la interfaz y generación de códigos TOTP
 */

// Estado global de la aplicación
const appState = {
  accounts: [],
  updateInterval: null,
  scannerStream: null
};

// Inicializar la extensión cuando se carga el popup
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Inicializa la aplicación
 */
async function initializeApp() {
  await loadAccounts();
  renderAccounts();
  setupEventListeners();
  startAutoUpdate();
}

/**
 * Carga las cuentas desde chrome.storage
 */
async function loadAccounts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accounts'], (result) => {
      appState.accounts = result.accounts || [];
      resolve();
    });
  });
}

/**
 * Guarda las cuentas en chrome.storage
 */
async function saveAccounts() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ accounts: appState.accounts }, () => {
      resolve();
    });
  });
}

/**
 * Renderiza todas las cuentas en la UI
 */
function renderAccounts() {
  const accountsList = document.getElementById('accounts-list');
  const emptyState = document.getElementById('empty-state');
  const addBtnContainer = document.getElementById('add-account-btn-container');

  // Mostrar estado vacío si no hay cuentas
  if (appState.accounts.length === 0) {
    accountsList.innerHTML = '';
    emptyState.classList.remove('hidden');
    addBtnContainer.classList.add('hidden');
    return;
  }

  // Ocultar estado vacío y mostrar botón de agregar
  emptyState.classList.add('hidden');
  addBtnContainer.classList.remove('hidden');

  // Renderizar cada cuenta
  accountsList.innerHTML = appState.accounts.map((account, index) => {
    const code = generateTOTP(account);
    const timeRemaining = getTimeRemaining(account.period || 30);
    const progress = (timeRemaining / (account.period || 30)) * 100;
    const isWarning = timeRemaining <= 10;

    return `
      <div class="account-card" data-index="${index}">
        <div class="account-header">
          <div class="account-info">
            <h3>${escapeHtml(account.name)}</h3>
            <p>${escapeHtml(account.platform)}</p>
          </div>
          <button class="account-delete" data-index="${index}" title="Eliminar cuenta">
            🗑️
          </button>
        </div>
        <div class="code-container">
          <div class="code-display">${formatCode(code)}</div>
          <button class="copy-btn" data-index="${index}">
            Copiar
          </button>
        </div>
        <div class="timer-bar-container">
          <div class="timer-bar ${isWarning ? 'warning' : ''}" style="width: ${progress}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Agregar event listeners a los botones de copiar y eliminar
  setupAccountButtons();
}

/**
 * Genera un código TOTP para una cuenta
 * @param {Object} account - Configuración de la cuenta
 * @returns {string} - Código TOTP generado
 */
function generateTOTP(account) {
  try {
    // Crear instancia TOTP usando la librería OTPAuth
    const totp = new OTPAuth.TOTP({
      issuer: account.platform || 'Account',
      label: account.name || 'User',
      algorithm: account.algorithm || 'SHA1',
      digits: parseInt(account.digits) || 6,
      period: parseInt(account.period) || 30,
      secret: OTPAuth.Secret.fromBase32(stripSpaces(account.secret))
    });

    // Generar y truncar el código
    const token = totp.generate();
    return truncateTo(token, account.digits || 6);
  } catch (error) {
    console.error('Error generando TOTP:', error);
    return '------';
  }
}

/**
 * Calcula el tiempo restante en segundos para el período actual
 * @param {number} period - Período en segundos
 * @returns {number} - Segundos restantes
 */
function getTimeRemaining(period = 30) {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

/**
 * Formatea el código TOTP para mejor legibilidad
 * @param {string} code - Código sin formatear
 * @returns {string} - Código formateado
 */
function formatCode(code) {
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  return code;
}

/**
 * Elimina espacios de una cadena
 * @param {string} str - Cadena con espacios
 * @returns {string} - Cadena sin espacios
 */
function stripSpaces(str) {
  return str.replace(/\s/g, '');
}

/**
 * Trunca una cadena a un número específico de dígitos
 * @param {string} str - Cadena a truncar
 * @param {number} digits - Número de dígitos
 * @returns {string} - Cadena truncada
 */
function truncateTo(str, digits) {
  if (str.length <= digits) {
    return str;
  }
  return str.slice(-digits);
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Configura los event listeners principales
 */
function setupEventListeners() {
  // Botón agregar primera cuenta
  document.getElementById('add-first-account')?.addEventListener('click', openAddModal);

  // Botón agregar cuenta
  document.getElementById('add-account-btn')?.addEventListener('click', openAddModal);

  // Botón cerrar modal
  document.getElementById('close-modal')?.addEventListener('click', closeAddModal);

  // Cerrar modal al hacer clic fuera
  document.getElementById('add-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'add-modal') {
      closeAddModal();
    }
  });

  // Tabs del modal
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Formulario manual
  document.getElementById('manual-form')?.addEventListener('submit', handleManualSubmit);

  // Botón iniciar cámara
  document.getElementById('start-camera')?.addEventListener('click', startQRScanner);
}

/**
 * Configura los botones de cada tarjeta de cuenta
 */
function setupAccountButtons() {
  // Botones de copiar
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      copyToClipboard(index);
    });
  });

  // Botones de eliminar
  document.querySelectorAll('.account-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      deleteAccount(index);
    });
  });

  // Clic en tarjeta para copiar
  document.querySelectorAll('.account-card').forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.dataset.index);
      copyToClipboard(index);
    });
  });
}

/**
 * Copia el código TOTP al portapapeles
 * @param {number} index - Índice de la cuenta
 */
async function copyToClipboard(index) {
  const account = appState.accounts[index];
  const code = generateTOTP(account);

  try {
    await navigator.clipboard.writeText(code.replace(/\s/g, ''));

    // Feedback visual
    const btn = document.querySelector(`.copy-btn[data-index="${index}"]`);
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓ Copiado';
      btn.classList.add('copied');

      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 2000);
    }
  } catch (error) {
    console.error('Error copiando al portapapeles:', error);
    alert('No se pudo copiar el código');
  }
}

/**
 * Elimina una cuenta
 * @param {number} index - Índice de la cuenta
 */
async function deleteAccount(index) {
  const account = appState.accounts[index];
  const confirmed = confirm(`¿Eliminar la cuenta de ${account.name} (${account.platform})?`);

  if (confirmed) {
    appState.accounts.splice(index, 1);
    await saveAccounts();
    renderAccounts();
  }
}

/**
 * Inicia la actualización automática de códigos
 */
function startAutoUpdate() {
  // Actualizar cada segundo
  if (appState.updateInterval) {
    clearInterval(appState.updateInterval);
  }

  appState.updateInterval = setInterval(() => {
    renderAccounts();
  }, 1000);
}

/**
 * Abre el modal para agregar cuenta
 */
function openAddModal() {
  document.getElementById('add-modal').classList.remove('hidden');
}

/**
 * Cierra el modal de agregar cuenta
 */
function closeAddModal() {
  document.getElementById('add-modal').classList.add('hidden');
  document.getElementById('manual-form').reset();
  stopQRScanner();
}

/**
 * Cambia entre tabs del modal
 * @param {string} tabName - Nombre del tab
 */
function switchTab(tabName) {
  // Actualizar botones
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Actualizar contenido
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });

  // Detener scanner si se cambia de tab
  if (tabName !== 'qr') {
    stopQRScanner();
  }
}

/**
 * Maneja el envío del formulario manual
 * @param {Event} e - Evento de submit
 */
async function handleManualSubmit(e) {
  e.preventDefault();

  const account = {
    name: document.getElementById('account-name').value.trim(),
    platform: document.getElementById('account-platform').value.trim(),
    secret: document.getElementById('secret-key').value.trim().toUpperCase(),
    digits: parseInt(document.getElementById('digits').value),
    period: parseInt(document.getElementById('period').value),
    algorithm: document.getElementById('algorithm').value
  };

  // Validar que la clave secreta sea válida
  try {
    OTPAuth.Secret.fromBase32(stripSpaces(account.secret));
  } catch (error) {
    alert('La clave secreta no es válida. Debe ser una cadena en formato Base32.');
    return;
  }

  // Agregar cuenta
  appState.accounts.push(account);
  await saveAccounts();
  renderAccounts();
  closeAddModal();
}

/**
 * Inicia el escáner de códigos QR
 */
async function startQRScanner() {
  const video = document.getElementById('qr-video');
  const instructions = document.getElementById('qr-instructions');

  try {
    // Solicitar acceso a la cámara
    appState.scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });

    video.srcObject = appState.scannerStream;
    video.play();

    instructions.classList.add('hidden');
    video.classList.remove('hidden');

    // Aquí se integraría una librería de escaneo QR como jsQR
    // Por ahora mostramos un mensaje
    alert('Función de escaneo QR en desarrollo. Por favor, usa la opción manual.');
    stopQRScanner();
  } catch (error) {
    console.error('Error accediendo a la cámara:', error);
    alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
  }
}

/**
 * Detiene el escáner de códigos QR
 */
function stopQRScanner() {
  if (appState.scannerStream) {
    appState.scannerStream.getTracks().forEach(track => track.stop());
    appState.scannerStream = null;
  }

  const video = document.getElementById('qr-video');
  const instructions = document.getElementById('qr-instructions');

  video.classList.add('hidden');
  instructions.classList.remove('hidden');
}

// Limpiar interval al cerrar el popup
window.addEventListener('beforeunload', () => {
  if (appState.updateInterval) {
    clearInterval(appState.updateInterval);
  }
  stopQRScanner();
});
