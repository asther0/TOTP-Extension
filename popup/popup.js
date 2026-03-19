/**
 * TOTP Authenticator Extension - Popup Logic
 * Maneja la interfaz y generación de códigos TOTP
 */

// Estado global de la aplicación
const appState = {
  accounts: [],
  updateInterval: null,
  searchQuery: '',
  sortBy: 'name-asc',
  lastRenderTime: 0,
  renderThrottle: false,
  currentCaptureData: null,
  currentCaptureImage: null
};

// Inicializar la extensión cuando se carga el popup
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Inicializa la aplicación
 */
async function initializeApp() {
  await loadAccounts();
  await loadSortPreference();
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
  // Throttle renders para mejorar rendimiento
  const now = Date.now();
  if (appState.renderThrottle && now - appState.lastRenderTime < 100) {
    return;
  }
  appState.lastRenderTime = now;

  const accountsList = document.getElementById('accounts-list');
  const emptyState = document.getElementById('empty-state');
  const addBtnContainer = document.getElementById('add-account-btn-container');
  const searchContainer = document.getElementById('search-container');

  // Mostrar/ocultar barra de búsqueda
  if (appState.accounts.length > 3) {
    searchContainer.classList.remove('hidden');
  } else {
    searchContainer.classList.add('hidden');
  }

  // Filtrar cuentas según búsqueda
  let filteredAccounts = appState.accounts.filter(account => {
    if (!appState.searchQuery) return true;
    const query = appState.searchQuery.toLowerCase();
    return account.name.toLowerCase().includes(query) ||
           account.platform.toLowerCase().includes(query);
  });

  // Ordenar cuentas
  filteredAccounts = sortAccounts(filteredAccounts, appState.sortBy);

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

  // Mostrar mensaje si no hay resultados de búsqueda
  if (filteredAccounts.length === 0 && appState.searchQuery) {
    accountsList.innerHTML = `
      <div class="empty-state">
        <p>No se encontraron cuentas que coincidan con "${appState.searchQuery}"</p>
      </div>
    `;
    return;
  }

  // Renderizar cada cuenta
  accountsList.innerHTML = filteredAccounts.map((account, index) => {
    // Obtener el índice real en el array completo
    const realIndex = appState.accounts.indexOf(account);
    const code = generateTOTP(account);
    const period = account.period || 30;
    const timeRemaining = getTimeRemaining(period);
    const progress = (timeRemaining / period) * 100;
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (progress / 100) * circumference;

    let timerClass = '';
    if (timeRemaining <= 5) timerClass = 'danger';
    else if (timeRemaining <= 10) timerClass = 'warning';

    return `
      <div class="account-card" data-index="${realIndex}">
        <div class="account-header">
          <div class="account-info">
            <h3>${escapeHtml(account.platform)}</h3>
            <p>${escapeHtml(account.name)}</p>
          </div>
        </div>
        <div class="code-row">
          <div class="timer-circle">
            <svg viewBox="0 0 36 36">
              <circle class="timer-bg" cx="18" cy="18" r="15.5"/>
              <circle class="timer-progress ${timerClass}" cx="18" cy="18" r="15.5"
                stroke-dasharray="97.4"
                stroke-dashoffset="${97.4 - (progress / 100) * 97.4}"/>
            </svg>
            <span class="timer-text">${timeRemaining}</span>
          </div>
          <div class="code-display">${formatCode(code)}</div>
          <button class="copy-btn" data-index="${realIndex}">Copiar</button>
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

  // Captura de pantalla
  document.getElementById('capture-screen-btn')?.addEventListener('click', captureVisibleTab);
  document.getElementById('scan-area-btn')?.addEventListener('click', scanSelectedArea);

  // Subir archivo
  document.getElementById('upload-file-btn')?.addEventListener('click', () => {
    document.getElementById('qr-file-input').click();
  });
  document.getElementById('qr-file-input')?.addEventListener('change', handleFileUpload);

  // Búsqueda
  document.getElementById('search-input')?.addEventListener('input', handleSearch);
  document.getElementById('clear-search')?.addEventListener('click', clearSearch);

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', handleSort);

  // Settings
  document.getElementById('settings-btn')?.addEventListener('click', openSettings);
  document.getElementById('back-btn')?.addEventListener('click', closeSettings);
}

/**
 * Abre la vista de configuraciones
 */
function openSettings() {
  document.getElementById('accounts-list').classList.add('hidden');
  document.getElementById('search-container')?.classList.add('hidden');
  document.getElementById('add-account-btn-container')?.classList.add('hidden');
  document.getElementById('empty-state')?.classList.add('hidden');
  document.getElementById('settings-view').classList.remove('hidden');
  renderSettingsAccounts();
}

/**
 * Cierra la vista de configuraciones
 */
function closeSettings() {
  document.getElementById('settings-view').classList.add('hidden');
  renderAccounts();
}

/**
 * Renderiza la lista de cuentas en configuraciones
 */
function renderSettingsAccounts() {
  const container = document.getElementById('settings-accounts');
  if (!container) return;

  if (appState.accounts.length === 0) {
    container.innerHTML = '<p class="settings-empty">No hay cuentas</p>';
    return;
  }

  container.innerHTML = appState.accounts.map((account, index) => `
    <div class="settings-account-item">
      <div class="settings-account-info">
        <span class="settings-account-name">${escapeHtml(account.platform)}</span>
        <span class="settings-account-email">${escapeHtml(account.name)}</span>
      </div>
      <button class="settings-delete-btn" data-index="${index}">Eliminar</button>
    </div>
  `).join('');

  // Event listeners para eliminar
  container.querySelectorAll('.settings-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      if (confirm(`Eliminar ${appState.accounts[index].platform}?`)) {
        deleteAccount(index);
      }
    });
  });
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

    // Feedback visual en tarjeta
    const card = document.querySelector(`.account-card[data-index="${index}"]`);
    if (card) {
      card.classList.add('copied');
      setTimeout(() => card.classList.remove('copied'), 2000);
    }

    // Feedback visual en boton
    const btn = document.querySelector(`.copy-btn[data-index="${index}"]`);
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Copiado';
      btn.classList.add('copied');

      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 2000);
    }
  } catch (error) {
    console.error('Error copiando al portapapeles:', error);
    alert('No se pudo copiar el codigo');
  }
}

/**
 * Elimina una cuenta
 * @param {number} index - Indice de la cuenta
 */
async function deleteAccount(index) {
  appState.accounts.splice(index, 1);
  await saveAccounts();
  renderSettingsAccounts();
  renderAccounts();
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
    // Solo re-renderizar si han pasado códigos que necesitan actualización
    const needsUpdate = appState.accounts.some(account => {
      const timeRemaining = getTimeRemaining(account.period || 30);
      // Re-renderizar cuando cambia el código o cada 1 segundo si quedan menos de 10
      return timeRemaining === (account.period || 30) || timeRemaining <= 10;
    });

    if (needsUpdate || !appState.renderThrottle) {
      renderAccounts();
      appState.renderThrottle = true;
    }
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
  clearCapturePreview();
}

/**
 * Cambia entre tabs del modal
 * @param {string} tabName - Nombre del tab
 */
function switchTab(tabName) {
  // Actualizar botones
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });

  // Actualizar contenido
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });

  // Limpiar preview si se cambia de tab
  if (tabName !== 'capture' && tabName !== 'upload') {
    clearCapturePreview();
  }
}

/**
 * Maneja el envío del formulario manual
 * @param {Event} e - Evento de submit
 */
async function handleManualSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('account-name').value.trim();
  const platform = document.getElementById('account-platform').value.trim();
  const secret = document.getElementById('secret-key').value.trim().toUpperCase();

  // Validar nombre y plataforma
  if (!name || !platform) {
    alert('El nombre y la plataforma son obligatorios');
    return;
  }

  // Validar duplicados
  if (isDuplicateAccount(name, platform)) {
    alert(`Ya existe una cuenta con el nombre "${name}" en la plataforma "${platform}"`);
    return;
  }

  // Validar clave secreta
  const validation = validateSecret(secret);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  const account = {
    name,
    platform,
    secret: stripSpaces(secret),
    digits: parseInt(document.getElementById('digits').value),
    period: parseInt(document.getElementById('period').value),
    algorithm: document.getElementById('algorithm').value,
    createdAt: new Date().toISOString()
  };

  // Agregar cuenta
  appState.accounts.push(account);
  await saveAccounts();
  renderAccounts();
  closeAddModal();
}

/**
 * Captura la pestaña visible actual del navegador
 */
async function captureVisibleTab() {
  try {
    const captureBtn = document.getElementById('capture-screen-btn');
    captureBtn.disabled = true;
    captureBtn.textContent = 'Capturando...';

    // Capturar pestaña visible
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }

      // Mostrar preview y permitir selección de área
      displayCapturePreview(dataUrl, 'capture');

      captureBtn.disabled = false;
      captureBtn.textContent = 'Capturar Pestaña';
    });
  } catch (error) {
    console.error('Error capturando pantalla:', error);
    alert('No se pudo capturar la pantalla. Asegúrate de que la extensión tiene permisos necesarios.');
    document.getElementById('capture-screen-btn').disabled = false;
    document.getElementById('capture-screen-btn').textContent = 'Capturar Pestaña';
  }
}

/**
 * Muestra el preview de la captura y permite seleccionar área
 * @param {string} dataUrl - Data URL de la imagen capturada
 * @param {string} source - Fuente de la imagen ('capture' o 'upload')
 */
function displayCapturePreview(dataUrl, source) {
  const previewContainer = source === 'capture'
    ? document.getElementById('capture-preview')
    : document.getElementById('upload-preview');

  const img = new Image();
  img.onload = () => {
    previewContainer.innerHTML = '';
    previewContainer.appendChild(img);
    previewContainer.classList.remove('hidden');

    // Guardar imagen en estado para procesamiento
    appState.currentCaptureData = dataUrl;
    appState.currentCaptureImage = img;

    // Mostrar botón de escanear si es captura
    if (source === 'capture') {
      document.getElementById('scan-area-btn').classList.remove('hidden');
    } else {
      // Para upload, escanear automáticamente
      scanFullImage(dataUrl);
    }
  };
  img.src = dataUrl;
  img.style.maxWidth = '100%';
  img.style.borderRadius = '8px';
}

/**
 * Escanea el área seleccionada (por ahora toda la imagen)
 */
async function scanSelectedArea() {
  if (!appState.currentCaptureData) {
    alert('No hay imagen para escanear');
    return;
  }

  scanFullImage(appState.currentCaptureData);
}

/**
 * Escanea toda la imagen en busca de código QR
 * @param {string} dataUrl - Data URL de la imagen
 */
async function scanFullImage(dataUrl) {
  const scanBtn = document.getElementById('scan-area-btn');
  if (scanBtn) {
    scanBtn.disabled = true;
    scanBtn.textContent = 'Escaneando...';
  }

  try {
    // Cargar imagen en canvas
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('processing-canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Obtener datos de imagen
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Escanear con jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        // QR encontrado, parsear y auto-completar
        const parsedData = parseOTPAuthURI(code.data);
        if (parsedData) {
          autoFillFormFromQR(parsedData);
          switchTab('manual');
          alert('Código QR escaneado correctamente. Revisa y guarda la cuenta.');
        } else {
          alert('El código QR no contiene datos TOTP válidos.');
        }
      } else {
        alert('No se encontró un código QR en la imagen. Asegúrate de que el QR sea visible y esté completo.');
      }

      if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.textContent = 'Escanear Área Seleccionada';
      }
    };
    img.src = dataUrl;
  } catch (error) {
    console.error('Error escaneando QR:', error);
    alert('Error al escanear el código QR.');
    if (scanBtn) {
      scanBtn.disabled = false;
      scanBtn.textContent = 'Escanear Área Seleccionada';
    }
  }
}

/**
 * Maneja la subida de archivo de imagen
 * @param {Event} event - Evento de change del input file
 */
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tipo de archivo
  if (!file.type.match('image.*')) {
    alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG, WebP)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    displayCapturePreview(e.target.result, 'upload');
  };
  reader.readAsDataURL(file);
}

/**
 * Parsea una URI otpauth://
 * @param {string} uri - URI a parsear
 * @returns {Object|null} - Datos parseados o null si es inválido
 */
function parseOTPAuthURI(uri) {
  try {
    // Validar formato básico
    if (!uri.startsWith('otpauth://totp/')) {
      return null;
    }

    const url = new URL(uri);

    // Extraer label (formato: issuer:account o solo account)
    const label = decodeURIComponent(url.pathname.substring(1));
    let issuer = '';
    let account = label;

    if (label.includes(':')) {
      const parts = label.split(':');
      issuer = parts[0];
      account = parts.slice(1).join(':');
    }

    // Extraer parámetros
    const secret = url.searchParams.get('secret');
    const issuerParam = url.searchParams.get('issuer');
    const algorithm = url.searchParams.get('algorithm') || 'SHA1';
    const digits = url.searchParams.get('digits') || '6';
    const period = url.searchParams.get('period') || '30';

    // Validar que tenga secret
    if (!secret) {
      return null;
    }

    return {
      name: account || 'Account',
      platform: issuerParam || issuer || 'Platform',
      secret: secret,
      algorithm: algorithm.toUpperCase(),
      digits: parseInt(digits),
      period: parseInt(period)
    };
  } catch (error) {
    console.error('Error parseando otpauth URI:', error);
    return null;
  }
}

/**
 * Auto-completa el formulario con datos del QR
 * @param {Object} data - Datos parseados del QR
 */
function autoFillFormFromQR(data) {
  document.getElementById('account-name').value = data.name;
  document.getElementById('account-platform').value = data.platform;
  document.getElementById('secret-key').value = data.secret;
  document.getElementById('digits').value = data.digits;
  document.getElementById('period').value = data.period;
  document.getElementById('algorithm').value = data.algorithm;
}

/**
 * Limpia el preview de captura
 */
function clearCapturePreview() {
  const capturePreview = document.getElementById('capture-preview');
  const uploadPreview = document.getElementById('upload-preview');
  const scanBtn = document.getElementById('scan-area-btn');

  if (capturePreview) {
    capturePreview.innerHTML = '';
    capturePreview.classList.add('hidden');
  }

  if (uploadPreview) {
    uploadPreview.innerHTML = '';
    uploadPreview.classList.add('hidden');
  }

  if (scanBtn) {
    scanBtn.classList.add('hidden');
  }

  appState.currentCaptureData = null;
  appState.currentCaptureImage = null;
}

/**
 * Maneja la búsqueda de cuentas
 * @param {Event} e - Evento de input
 */
function handleSearch(e) {
  appState.searchQuery = e.target.value.trim();
  const clearBtn = document.getElementById('clear-search');

  if (appState.searchQuery) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  // Deshabilitar throttle durante búsqueda para respuesta inmediata
  appState.renderThrottle = false;
  renderAccounts();
}

/**
 * Limpia la búsqueda
 */
function clearSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';
  appState.searchQuery = '';
  document.getElementById('clear-search').classList.add('hidden');
  renderAccounts();
}

/**
 * Ordena las cuentas según el criterio especificado
 * @param {Array} accounts - Array de cuentas a ordenar
 * @param {string} sortBy - Criterio de ordenamiento
 * @returns {Array} - Array ordenado
 */
function sortAccounts(accounts, sortBy) {
  const sorted = [...accounts];

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'platform-asc':
      return sorted.sort((a, b) => a.platform.localeCompare(b.platform));
    case 'platform-desc':
      return sorted.sort((a, b) => b.platform.localeCompare(a.platform));
    case 'date-asc':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateA - dateB;
      });
    case 'date-desc':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    default:
      return sorted;
  }
}

/**
 * Carga la preferencia de ordenamiento
 */
async function loadSortPreference() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['sortBy'], (result) => {
      if (result.sortBy) {
        appState.sortBy = result.sortBy;
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
          sortSelect.value = result.sortBy;
        }
      }
      resolve();
    });
  });
}

/**
 * Guarda la preferencia de ordenamiento
 * @param {string} sortBy - Criterio de ordenamiento
 */
async function saveSortPreference(sortBy) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ sortBy }, () => {
      resolve();
    });
  });
}

/**
 * Maneja el cambio de ordenamiento
 * @param {Event} e - Evento de change
 */
async function handleSort(e) {
  appState.sortBy = e.target.value;
  await saveSortPreference(appState.sortBy);
  renderAccounts();
}

/**
 * Valida que una clave secreta sea válida en Base32
 * @param {string} secret - Clave a validar
 * @returns {Object} - {valid: boolean, error: string}
 */
function validateSecret(secret) {
  const cleaned = stripSpaces(secret).toUpperCase();

  // Verificar que no esté vacía
  if (!cleaned) {
    return { valid: false, error: 'La clave secreta no puede estar vacía' };
  }

  // Verificar caracteres válidos en Base32 (A-Z, 2-7, =)
  const base32Regex = /^[A-Z2-7=]+$/;
  if (!base32Regex.test(cleaned)) {
    return { valid: false, error: 'La clave debe contener solo caracteres válidos de Base32 (A-Z, 2-7)' };
  }

  // Verificar longitud mínima (generalmente 16 caracteres)
  if (cleaned.replace(/=/g, '').length < 16) {
    return { valid: false, error: 'La clave es demasiado corta (mínimo 16 caracteres)' };
  }

  // Intentar decodificar con OTPAuth
  try {
    OTPAuth.Secret.fromBase32(cleaned);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: 'La clave secreta no es válida en formato Base32' };
  }
}

/**
 * Valida que el nombre de cuenta no esté duplicado
 * @param {string} name - Nombre a validar
 * @param {string} platform - Plataforma a validar
 * @returns {boolean} - true si ya existe
 */
function isDuplicateAccount(name, platform) {
  return appState.accounts.some(
    account => account.name.toLowerCase() === name.toLowerCase() &&
               account.platform.toLowerCase() === platform.toLowerCase()
  );
}

// Limpiar interval al cerrar el popup
window.addEventListener('beforeunload', () => {
  if (appState.updateInterval) {
    clearInterval(appState.updateInterval);
  }
});
