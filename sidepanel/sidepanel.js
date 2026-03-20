/**
 * TOTP Authenticator - Side Panel
 */

const state = {
  accounts: [],
  updateInterval: null
};

// Inicializar
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadAccounts();
  render();
  setupListeners();
  startAutoUpdate();

  // Transicion suave: ocultar loading, mostrar contenido
  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
    document.querySelector('.container').classList.add('loaded');
  }, 300);
}

// Cargar cuentas
async function loadAccounts() {
  return new Promise(resolve => {
    chrome.storage.local.get(['accounts'], result => {
      state.accounts = result.accounts || [];
      resolve();
    });
  });
}

// Guardar cuentas
async function saveAccounts() {
  return new Promise(resolve => {
    chrome.storage.local.set({ accounts: state.accounts }, resolve);
  });
}

// Renderizar vista principal
function render() {
  const list = document.getElementById('accounts-list');
  const empty = document.getElementById('empty-state');
  const footer = document.getElementById('footer');

  // Estado vacio
  if (state.accounts.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    footer.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  footer.classList.remove('hidden');

  // Renderizar tarjetas
  list.innerHTML = state.accounts.map((acc, i) => {
    const code = generateTOTP(acc);
    const period = acc.period || 30;
    const timeLeft = getTimeRemaining(period);
    const progress = (timeLeft / period) * 100;
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (progress / 100) * circumference;

    let timerClass = '';
    if (timeLeft <= 5) timerClass = 'danger';
    else if (timeLeft <= 10) timerClass = 'warning';

    return `
      <div class="account-card" data-index="${i}">
        <div class="account-info">
          <div class="account-platform">${escapeHtml(acc.platform)}</div>
          <div class="account-name">${escapeHtml(acc.name)}</div>
        </div>
        <div class="code-row">
          <div class="timer">
            <svg viewBox="0 0 44 44">
              <circle class="timer-bg" cx="22" cy="22" r="18"/>
              <circle class="timer-progress ${timerClass}" cx="22" cy="22" r="18"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"/>
            </svg>
            <span class="timer-text">${timeLeft}</span>
          </div>
          <div class="code">${formatCode(code)}</div>
        </div>
        <div class="copied-feedback">Copiado!</div>
      </div>
    `;
  }).join('');

  setupCardListeners();
}

// Generar TOTP
function generateTOTP(account) {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: account.platform,
      label: account.name,
      algorithm: account.algorithm || 'SHA1',
      digits: account.digits || 6,
      period: account.period || 30,
      secret: OTPAuth.Secret.fromBase32(account.secret.replace(/\s/g, ''))
    });
    return totp.generate();
  } catch (e) {
    return '------';
  }
}

// Tiempo restante
function getTimeRemaining(period = 30) {
  return period - (Math.floor(Date.now() / 1000) % period);
}

// Formatear codigo
function formatCode(code) {
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  return code;
}

// Escapar HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listeners de tarjetas
function setupCardListeners() {
  document.querySelectorAll('.account-card').forEach(card => {
    card.addEventListener('click', () => {
      copyCode(parseInt(card.dataset.index), card);
    });
  });
}

// Copiar codigo
async function copyCode(index, card) {
  const account = state.accounts[index];
  if (!account) return;

  const code = generateTOTP(account).replace(/\s/g, '');

  try {
    await navigator.clipboard.writeText(code);

    // Feedback visual
    card.classList.add('copied');

    // Auto-cerrar con transicion suave
    setTimeout(() => {
      const container = document.querySelector('.container');
      container.classList.add('closing');

      // Cerrar despues de la animacion
      setTimeout(() => {
        window.close();
      }, 400);
    }, 1400);
  } catch (e) {
    console.error('Error copiando:', e);
  }
}

// Configurar listeners globales
function setupListeners() {
  // Boton agregar
  document.getElementById('add-btn')?.addEventListener('click', openModal);
  document.getElementById('add-first-btn')?.addEventListener('click', openModal);

  // Modal
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('add-modal').addEventListener('click', e => {
    if (e.target.id === 'add-modal') closeModal();
  });

  // Tabs
  document.querySelectorAll('.modal-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // QR Options
  const qrFile = document.getElementById('qr-file');

  document.getElementById('capture-btn').addEventListener('click', captureScreen);
  document.getElementById('upload-btn').addEventListener('click', () => qrFile.click());
  document.getElementById('qr-retry').addEventListener('click', resetQrUpload);

  qrFile.addEventListener('change', e => {
    if (e.target.files[0]) processQrImage(e.target.files[0]);
  });

  // Formulario manual
  document.getElementById('add-form').addEventListener('submit', handleSubmit);

  // Settings
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('back-btn').addEventListener('click', closeSettings);

  // Escuchar cambios en storage
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.accounts) {
      state.accounts = changes.accounts.newValue || [];
      render();
    }
  });
}

// Modal
function openModal() {
  document.getElementById('add-modal').classList.remove('hidden');
  // Reset al tab QR por defecto
  switchTab('qr');
  resetQrUpload();
}

function closeModal() {
  document.getElementById('add-modal').classList.add('hidden');
  document.getElementById('add-form').reset();
  resetQrUpload();
}

// Tabs
function switchTab(tabName) {
  document.querySelectorAll('.modal-tabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${tabName}`);
  });
}

// QR Upload
function resetQrUpload() {
  document.getElementById('qr-file').value = '';
  document.getElementById('qr-preview').classList.add('hidden');
  document.querySelector('.qr-options').classList.remove('hidden');
  document.getElementById('qr-status').className = 'qr-status';
  document.getElementById('qr-status').textContent = '';
}

function showQrPreview() {
  document.querySelector('.qr-options').classList.add('hidden');
  document.getElementById('qr-preview').classList.remove('hidden');
}

// Capturar pantalla
async function captureScreen() {
  const status = document.getElementById('qr-status');
  const img = document.getElementById('qr-image');
  const captureBtn = document.getElementById('capture-btn');
  const uploadBtn = document.getElementById('upload-btn');

  // Deshabilitar botones mientras procesa
  captureBtn.disabled = true;
  uploadBtn.disabled = true;

  showQrPreview();
  status.className = 'qr-status loading';
  status.innerHTML = `
    <div class="status-icon loading-spinner"></div>
    <div class="status-content">
      <strong>Capturando pantalla...</strong>
      <small>Espera un momento</small>
    </div>
  `;

  try {
    const response = await chrome.runtime.sendMessage({ action: 'captureScreen' });

    if (response.error) {
      showError(status, 'Error de captura', response.error);
      captureBtn.disabled = false;
      uploadBtn.disabled = false;
      return;
    }

    img.src = response.dataUrl;
    status.className = 'qr-status loading';
    status.innerHTML = `
      <div class="status-icon loading-spinner"></div>
      <div class="status-content">
        <strong>Buscando código QR...</strong>
        <small>Analizando imagen</small>
      </div>
    `;

    img.onload = () => {
      scanQrFromImage(img, response.dataUrl);
      captureBtn.disabled = false;
      uploadBtn.disabled = false;
    };

    img.onerror = () => {
      showError(status, 'Error al cargar', 'No se pudo procesar la imagen capturada');
      captureBtn.disabled = false;
      uploadBtn.disabled = false;
    };
  } catch (e) {
    showError(status, 'Error inesperado', 'No se pudo capturar la pantalla. Asegúrate de tener permisos activos.');
    captureBtn.disabled = false;
    uploadBtn.disabled = false;
  }
}

async function processQrImage(file) {
  const img = document.getElementById('qr-image');
  const status = document.getElementById('qr-status');

  showQrPreview();
  const url = URL.createObjectURL(file);
  img.src = url;
  status.className = 'qr-status loading';
  status.innerHTML = `
    <div class="status-icon loading-spinner"></div>
    <div class="status-content">
      <strong>Escaneando código QR...</strong>
      <small>Procesando imagen</small>
    </div>
  `;

  img.onload = () => {
    scanQrFromImage(img, url);
  };
}

function scanQrFromImage(img, urlToRevoke) {
  const status = document.getElementById('qr-status');
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (code && code.data) {
    const parsed = parseOtpAuthUri(code.data);
    if (parsed) {
      status.className = 'qr-status success';
      status.innerHTML = `
        <div class="status-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div class="status-content">
          <strong>¡Cuenta detectada!</strong>
          <small>${escapeHtml(parsed.platform)} - ${escapeHtml(parsed.name)}</small>
        </div>
      `;

      setTimeout(() => {
        addAccountFromQr(parsed);
      }, 800);
    } else {
      showError(status, 'Código QR inválido', 'El QR no contiene datos TOTP válidos. Asegúrate de escanear un código de autenticación.');
    }
  } else {
    showError(status, 'No se encontró código QR', 'No se detectó ningún código QR en la imagen. Intenta con una imagen más clara o captura la pantalla completa.');
  }

  if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
    URL.revokeObjectURL(urlToRevoke);
  }
}

// Función helper para mostrar errores con estilo
function showError(statusElement, title, message) {
  statusElement.className = 'qr-status error';
  statusElement.innerHTML = `
    <div class="status-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4m0 4h.01"/>
      </svg>
    </div>
    <div class="status-content">
      <strong>${title}</strong>
      <small>${message}</small>
    </div>
  `;
}

function parseOtpAuthUri(uri) {
  try {
    if (!uri.startsWith('otpauth://totp/')) return null;

    const url = new URL(uri);
    const label = decodeURIComponent(url.pathname.substring(1));

    let issuer = '';
    let account = label;
    if (label.includes(':')) {
      const parts = label.split(':');
      issuer = parts[0];
      account = parts.slice(1).join(':');
    }

    const secret = url.searchParams.get('secret');
    const issuerParam = url.searchParams.get('issuer');

    if (!secret) return null;

    return {
      platform: issuerParam || issuer || 'Cuenta',
      name: account || 'Usuario',
      secret: secret.toUpperCase(),
      digits: parseInt(url.searchParams.get('digits')) || 6,
      period: parseInt(url.searchParams.get('period')) || 30,
      algorithm: (url.searchParams.get('algorithm') || 'SHA1').toUpperCase()
    };
  } catch (e) {
    return null;
  }
}

async function addAccountFromQr(data) {
  // Verificar duplicado
  if (state.accounts.some(a =>
    a.platform.toLowerCase() === data.platform.toLowerCase() &&
    a.name.toLowerCase() === data.name.toLowerCase()
  )) {
    alert('Esta cuenta ya existe');
    resetQrUpload();
    return;
  }

  state.accounts.push({
    ...data,
    createdAt: new Date().toISOString()
  });

  await saveAccounts();
  closeModal();
  render();
}

// Manejar formulario
async function handleSubmit(e) {
  e.preventDefault();

  const platform = document.getElementById('platform').value.trim();
  const name = document.getElementById('account').value.trim();
  const secret = document.getElementById('secret').value.trim().toUpperCase().replace(/\s/g, '');

  if (!platform || !name || !secret) {
    alert('Todos los campos son obligatorios');
    return;
  }

  // Validar Base32
  if (!/^[A-Z2-7]+=*$/.test(secret) || secret.length < 16) {
    alert('La clave secreta no es valida');
    return;
  }

  // Verificar duplicado
  if (state.accounts.some(a =>
    a.platform.toLowerCase() === platform.toLowerCase() &&
    a.name.toLowerCase() === name.toLowerCase()
  )) {
    alert('Esta cuenta ya existe');
    return;
  }

  state.accounts.push({
    platform,
    name,
    secret,
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
    createdAt: new Date().toISOString()
  });

  await saveAccounts();
  closeModal();
  render();
}

// Settings
function openSettings() {
  document.querySelector('header').classList.add('hidden');
  document.getElementById('main-view').classList.add('hidden');
  document.getElementById('footer').classList.add('hidden');
  document.getElementById('settings-view').classList.remove('hidden');
  renderSettings();
}

function closeSettings() {
  document.getElementById('settings-view').classList.add('hidden');
  document.querySelector('header').classList.remove('hidden');
  document.getElementById('main-view').classList.remove('hidden');
  render();
}

function renderSettings() {
  const list = document.getElementById('settings-list');

  if (state.accounts.length === 0) {
    list.innerHTML = '<p class="settings-empty">No hay cuentas</p>';
    return;
  }

  list.innerHTML = state.accounts.map((acc, i) => `
    <div class="settings-item">
      <div class="settings-item-info">
        <span class="settings-item-platform">${escapeHtml(acc.platform)}</span>
        <span class="settings-item-account">${escapeHtml(acc.name)}</span>
      </div>
      <button class="delete-btn" data-index="${i}">Eliminar</button>
    </div>
  `).join('');

  // Listeners eliminar
  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const index = parseInt(btn.dataset.index);
      const acc = state.accounts[index];
      if (confirm(`Eliminar ${acc.platform}?`)) {
        state.accounts.splice(index, 1);
        await saveAccounts();
        renderSettings();
      }
    });
  });
}

// Auto-update (solo actualiza timers y codigos, no recrea tarjetas)
function startAutoUpdate() {
  if (state.updateInterval) clearInterval(state.updateInterval);
  state.updateInterval = setInterval(updateTimers, 1000);
}

// Actualizar solo timers y codigos sin recrear tarjetas
function updateTimers() {
  document.querySelectorAll('.account-card').forEach(card => {
    const index = parseInt(card.dataset.index);
    const account = state.accounts[index];
    if (!account) return;

    const code = generateTOTP(account);
    const period = account.period || 30;
    const timeLeft = getTimeRemaining(period);
    const progress = (timeLeft / period) * 100;
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (progress / 100) * circumference;

    // Actualizar timer
    const timerProgress = card.querySelector('.timer-progress');
    const timerText = card.querySelector('.timer-text');
    if (timerProgress && timerText) {
      timerProgress.setAttribute('stroke-dashoffset', offset);
      timerProgress.classList.remove('warning', 'danger');
      if (timeLeft <= 5) timerProgress.classList.add('danger');
      else if (timeLeft <= 10) timerProgress.classList.add('warning');
      timerText.textContent = timeLeft;
    }

    // Actualizar codigo
    const codeEl = card.querySelector('.code');
    if (codeEl) {
      codeEl.textContent = formatCode(code);
    }
  });
}

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
  if (state.updateInterval) clearInterval(state.updateInterval);
});
