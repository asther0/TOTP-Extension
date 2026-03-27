/**
 * TOTP Authenticator - Side Panel
 */

const state = {
  accounts: [],
  updateInterval: null,
  editingIndex: null
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
        <div class="copied-feedback">Copiado</div>
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

    // Feedback visual inicial
    card.classList.add('copied');

    // Intentar auto-fill
    const autofilled = await attemptAutofill(code, card);

    // Auto-cerrar con transicion suave
    const delay = autofilled ? 1600 : 1400;
    setTimeout(() => {
      const container = document.querySelector('.container');
      container.classList.add('closing');

      // Cerrar despues de la animacion
      setTimeout(() => {
        window.close();
      }, 400);
    }, delay);
  } catch (e) {
    console.error('Error copiando:', e);
  }
}

// Intentar auto-fill en la página activa
async function attemptAutofill(code, card) {
  try {
    // Obtener la tab activa
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      return false;
    }

    // Enviar mensaje al content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'autofillMfa',
      code: code
    });

    if (response && response.success) {
      // Actualizar feedback visual a "auto-completado"
      updateFeedback(card, 'auto-filled');
      return true;
    } else {
      // Mantener feedback de "copiado"
      return false;
    }
  } catch (e) {
    // Si hay error (ej: content script no cargado), solo mantener "copiado"
    return false;
  }
}

// Actualizar feedback visual
function updateFeedback(card, type) {
  const feedback = card.querySelector('.copied-feedback');
  if (!feedback) return;

  if (type === 'auto-filled') {
    feedback.textContent = 'Auto-completado';
    feedback.style.background = 'rgba(34, 197, 94, 0.98)';
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

  // Edit modal
  document.getElementById('edit-form').addEventListener('submit', handleEditSubmit);
  document.getElementById('close-edit-modal').addEventListener('click', closeEditModal);
  document.getElementById('edit-modal').addEventListener('click', e => {
    if (e.target.id === 'edit-modal') closeEditModal();
  });

  // Export/Import
  document.getElementById('export-btn').addEventListener('click', exportAccounts);
  document.getElementById('import-btn').addEventListener('click', () =>
    document.getElementById('import-file').click()
  );
  document.getElementById('import-file').addEventListener('change', handleImportFile);

  // Import modal
  document.getElementById('close-import-modal').addEventListener('click', closeImportModal);
  document.getElementById('import-modal').addEventListener('click', e => {
    if (e.target.id === 'import-modal') closeImportModal();
  });
  document.getElementById('merge-btn').addEventListener('click', () => importAccounts('merge'));
  document.getElementById('replace-btn').addEventListener('click', () => importAccounts('replace'));
  document.getElementById('cancel-import-btn').addEventListener('click', closeImportModal);

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
  const preview = document.getElementById('qr-preview');
  preview.classList.add('hidden');
  preview.classList.remove('has-error');
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

  // Timeout de 10 segundos
  const timeoutId = setTimeout(() => {
    showError(status, 'Tiempo de espera agotado', 'La captura está tardando demasiado. Cierra otras pestañas e intenta nuevamente.');
    captureBtn.disabled = false;
    uploadBtn.disabled = false;
  }, 10000);

  try {
    const response = await chrome.runtime.sendMessage({ action: 'captureScreen' });
    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);
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
  const preview = document.getElementById('qr-preview');
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
      preview.classList.remove('has-error');
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
      preview.classList.add('has-error');
      showError(status, 'Código QR inválido', 'El QR no contiene datos TOTP válidos. Asegúrate de escanear un código de autenticación.');
    }
  } else {
    preview.classList.add('has-error');
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
    <div class="settings-item" draggable="true" data-index="${i}">
      <div class="drag-handle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="8" x2="20" y2="8"/>
          <line x1="4" y1="16" x2="20" y2="16"/>
        </svg>
      </div>
      <div class="settings-item-info">
        <span class="settings-item-platform">${escapeHtml(acc.platform)}</span>
        <span class="settings-item-account">${escapeHtml(acc.name)}</span>
      </div>
      <div class="settings-item-actions">
        <button class="edit-btn" data-index="${i}">Editar</button>
        <button class="delete-btn" data-index="${i}">Eliminar</button>
      </div>
    </div>
  `).join('');

  // Listeners editar
  list.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      openEditModal(index);
    });
  });

  // Listeners eliminar
  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      const acc = state.accounts[index];
      if (confirm(`Eliminar ${acc.platform}?`)) {
        state.accounts.splice(index, 1);
        await saveAccounts();
        renderSettings();
      }
    });
  });

  // Setup drag and drop
  setupDragAndDrop();
}

// Edit Modal
function openEditModal(index) {
  state.editingIndex = index;
  const account = state.accounts[index];

  // Rellenar formulario
  document.getElementById('edit-platform').value = account.platform;
  document.getElementById('edit-account').value = account.name;

  // Abrir modal
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  document.getElementById('edit-form').reset();
  state.editingIndex = null;
}

async function handleEditSubmit(e) {
  e.preventDefault();

  if (state.editingIndex === null) return;

  const platform = document.getElementById('edit-platform').value.trim();
  const name = document.getElementById('edit-account').value.trim();

  if (!platform || !name) {
    alert('Todos los campos son obligatorios');
    return;
  }

  // Verificar duplicado (excepto la cuenta actual)
  const isDuplicate = state.accounts.some((acc, i) =>
    i !== state.editingIndex &&
    acc.platform.toLowerCase() === platform.toLowerCase() &&
    acc.name.toLowerCase() === name.toLowerCase()
  );

  if (isDuplicate) {
    alert('Ya existe una cuenta con esta plataforma y nombre');
    return;
  }

  // Actualizar cuenta
  state.accounts[state.editingIndex].platform = platform;
  state.accounts[state.editingIndex].name = name;

  await saveAccounts();
  closeEditModal();
  renderSettings();
}

// Drag and Drop
let draggedIndex = null;

function setupDragAndDrop() {
  const items = document.querySelectorAll('.settings-item');

  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragleave', handleDragLeave);
  });
}

function handleDragStart(e) {
  draggedIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');

  // Limpiar todas las clases drag-over
  document.querySelectorAll('.settings-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = 'move';

  const targetIndex = parseInt(this.dataset.index);
  if (draggedIndex !== targetIndex) {
    this.classList.add('drag-over');
  }

  return false;
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

async function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  const targetIndex = parseInt(this.dataset.index);

  if (draggedIndex !== null && draggedIndex !== targetIndex) {
    // Reordenar el array
    const draggedItem = state.accounts[draggedIndex];
    state.accounts.splice(draggedIndex, 1);
    state.accounts.splice(targetIndex, 0, draggedItem);

    // Guardar cambios
    await saveAccounts();

    // Re-renderizar
    renderSettings();
  }

  return false;
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

// Export/Import Functions
let importData = null;

async function exportAccounts() {
  const btn = document.getElementById('export-btn');
  const originalContent = btn.innerHTML;

  if (state.accounts.length === 0) {
    alert('No hay cuentas para exportar');
    return;
  }

  try {
    // Mostrar loading
    btn.disabled = true;
    btn.innerHTML = `
      <div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
      <span>Exportando...</span>
    `;

    // Crear JSON con metadata
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      accounts: state.accounts
    };

    // Crear blob y descargar
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `totp-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Mostrar success
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>Exportado!</span>
    `;

    // Volver a estado normal
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }, 2000);
  } catch (e) {
    alert('Error al exportar: ' + e.message);
    btn.disabled = false;
    btn.innerHTML = originalContent;
  }
}

async function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const status = document.getElementById('import-status');
  const options = document.getElementById('import-options');

  // Abrir modal
  document.getElementById('import-modal').classList.remove('hidden');

  // Mostrar loading
  options.classList.add('hidden');
  status.className = 'import-status loading';
  status.innerHTML = `
    <div class="status-icon loading-spinner"></div>
    <div class="status-content">
      <strong>Cargando archivo...</strong>
      <small>Validando datos</small>
    </div>
  `;

  try {
    // Leer archivo
    const text = await readFileAsText(file);
    const data = JSON.parse(text);

    // Validar estructura
    const validation = validateImportData(data);
    if (!validation.valid) {
      status.className = 'import-status error';
      status.innerHTML = `
        <div class="status-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4m0 4h.01"/>
          </svg>
        </div>
        <div class="status-content">
          <strong>Archivo inválido</strong>
          <small>${escapeHtml(validation.error)}</small>
        </div>
      `;
      return;
    }

    // Detectar duplicados
    const accounts = data.accounts;
    const duplicates = detectDuplicates(accounts);

    // Guardar data temporalmente
    importData = { accounts, duplicates };

    // Mostrar success y opciones
    status.className = 'import-status success';
    status.innerHTML = `
      <div class="status-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <div class="status-content">
        <strong>Archivo válido</strong>
        <small>${accounts.length} cuentas detectadas</small>
      </div>
    `;

    // Actualizar resumen
    document.getElementById('import-count').textContent = accounts.length;
    if (duplicates.length > 0) {
      document.getElementById('import-duplicates').textContent = duplicates.length;
      document.getElementById('import-duplicates-text').classList.remove('hidden');
    } else {
      document.getElementById('import-duplicates-text').classList.add('hidden');
    }

    options.classList.remove('hidden');
  } catch (e) {
    status.className = 'import-status error';
    status.innerHTML = `
      <div class="status-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4m0 4h.01"/>
        </svg>
      </div>
      <div class="status-content">
        <strong>Error al leer archivo</strong>
        <small>${escapeHtml(e.message)}</small>
      </div>
    `;
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(new Error('Error al leer archivo'));
    reader.readAsText(file);
  });
}

function validateImportData(data) {
  // Validar JSON válido con campo accounts
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Archivo JSON inválido' };
  }

  if (!data.accounts || !Array.isArray(data.accounts)) {
    return { valid: false, error: 'Formato incorrecto: falta campo "accounts"' };
  }

  if (data.accounts.length === 0) {
    return { valid: false, error: 'El archivo no contiene cuentas' };
  }

  // Validar cada cuenta
  for (let i = 0; i < data.accounts.length; i++) {
    const acc = data.accounts[i];

    if (!acc.platform || typeof acc.platform !== 'string') {
      return { valid: false, error: `Cuenta ${i + 1}: falta "platform"` };
    }

    if (!acc.name || typeof acc.name !== 'string') {
      return { valid: false, error: `Cuenta ${i + 1}: falta "name"` };
    }

    if (!acc.secret || typeof acc.secret !== 'string') {
      return { valid: false, error: `Cuenta ${i + 1}: falta "secret"` };
    }

    // Validar Base32
    if (!/^[A-Z2-7]+=*$/.test(acc.secret)) {
      return { valid: false, error: `Cuenta ${i + 1}: secret inválido (debe ser Base32)` };
    }

    // Validar digits (opcional)
    if (acc.digits !== undefined) {
      const digits = parseInt(acc.digits);
      if (isNaN(digits) || digits < 6 || digits > 8) {
        return { valid: false, error: `Cuenta ${i + 1}: digits debe ser 6, 7 u 8` };
      }
    }

    // Validar period (opcional)
    if (acc.period !== undefined) {
      const period = parseInt(acc.period);
      if (isNaN(period) || period < 10 || period > 120) {
        return { valid: false, error: `Cuenta ${i + 1}: period debe estar entre 10 y 120` };
      }
    }

    // Validar algorithm (opcional)
    if (acc.algorithm !== undefined) {
      const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
      if (!validAlgorithms.includes(acc.algorithm.toUpperCase())) {
        return { valid: false, error: `Cuenta ${i + 1}: algorithm debe ser SHA1, SHA256 o SHA512` };
      }
    }
  }

  return { valid: true };
}

function detectDuplicates(accounts) {
  const duplicateIndices = [];

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    const isDuplicate = state.accounts.some(existing =>
      existing.platform.toLowerCase() === acc.platform.toLowerCase() &&
      existing.name.toLowerCase() === acc.name.toLowerCase()
    );

    if (isDuplicate) {
      duplicateIndices.push(i);
    }
  }

  return duplicateIndices;
}

async function importAccounts(mode) {
  if (!importData) return;

  const { accounts, duplicates } = importData;

  if (mode === 'replace') {
    // Confirmar con dialog nativo
    const confirmed = confirm(
      '⚠️ ADVERTENCIA: Esta acción eliminará todas tus cuentas actuales y las reemplazará con las del archivo.\n\n' +
      `Cuentas actuales: ${state.accounts.length}\n` +
      `Cuentas nuevas: ${accounts.length}\n\n` +
      '¿Estás seguro de continuar?'
    );

    if (!confirmed) return;

    // Reemplazar todas
    state.accounts = accounts.map(acc => ({
      platform: acc.platform,
      name: acc.name,
      secret: acc.secret.toUpperCase().replace(/\s/g, ''),
      digits: acc.digits || 6,
      period: acc.period || 30,
      algorithm: acc.algorithm ? acc.algorithm.toUpperCase() : 'SHA1',
      createdAt: acc.createdAt || new Date().toISOString()
    }));
  } else {
    // Merge: agregar solo nuevas (omitir duplicadas)
    const newAccounts = accounts.filter((acc, i) => !duplicates.includes(i));

    if (newAccounts.length === 0) {
      alert('No hay cuentas nuevas para agregar. Todas ya existen.');
      return;
    }

    // Agregar cuentas nuevas
    newAccounts.forEach(acc => {
      state.accounts.push({
        platform: acc.platform,
        name: acc.name,
        secret: acc.secret.toUpperCase().replace(/\s/g, ''),
        digits: acc.digits || 6,
        period: acc.period || 30,
        algorithm: acc.algorithm ? acc.algorithm.toUpperCase() : 'SHA1',
        createdAt: acc.createdAt || new Date().toISOString()
      });
    });
  }

  // Guardar y actualizar UI
  await saveAccounts();
  closeImportModal();
  renderSettings();
}

function closeImportModal() {
  document.getElementById('import-modal').classList.add('hidden');
  document.getElementById('import-file').value = '';
  document.getElementById('import-options').classList.add('hidden');
  document.getElementById('import-status').className = 'import-status';
  document.getElementById('import-status').innerHTML = '';
  importData = null;
}

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
  if (state.updateInterval) clearInterval(state.updateInterval);
});
