/**
 * TOTP Sidebar - Content Script
 * Inyecta un sidebar lateral para mostrar códigos MFA
 */

(function() {
  'use strict';

  // Evitar doble inyección
  if (document.getElementById('totp-sidebar-container')) return;

  // Estado del sidebar
  const state = {
    accounts: [],
    isOpen: false,
    searchQuery: '',
    updateInterval: null
  };

  // Crear estructura del sidebar
  function createSidebar() {
    const container = document.createElement('div');
    container.id = 'totp-sidebar-container';
    container.innerHTML = `
      <button class="totp-toggle-btn" title="TOTP Authenticator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </button>
      <div class="totp-sidebar">
        <div class="totp-header">
          <h1>TOTP Authenticator</h1>
          <button class="totp-close-btn" title="Cerrar">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="totp-search">
          <input type="text" class="totp-search-input" placeholder="Buscar cuentas...">
        </div>
        <div class="totp-accounts"></div>
        <div class="totp-footer">
          <button class="totp-add-btn">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Agregar Cuenta
          </button>
        </div>
      </div>
      <div class="totp-toast">Codigo copiado</div>
    `;

    document.body.appendChild(container);
    return container;
  }

  // Cargar cuentas desde storage
  async function loadAccounts() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['accounts'], (result) => {
        state.accounts = result.accounts || [];
        resolve();
      });
    });
  }

  // Generar código TOTP
  function generateTOTP(account) {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: account.platform || 'Account',
        label: account.name || 'User',
        algorithm: account.algorithm || 'SHA1',
        digits: parseInt(account.digits) || 6,
        period: parseInt(account.period) || 30,
        secret: OTPAuth.Secret.fromBase32(account.secret.replace(/\s/g, ''))
      });
      const token = totp.generate();
      const digits = account.digits || 6;
      return token.length > digits ? token.slice(-digits) : token;
    } catch (error) {
      console.error('Error generating TOTP:', error);
      return '------';
    }
  }

  // Calcular tiempo restante
  function getTimeRemaining(period = 30) {
    const now = Math.floor(Date.now() / 1000);
    return period - (now % period);
  }

  // Formatear código con espacio
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

  // Renderizar lista de cuentas
  function renderAccounts() {
    const container = document.querySelector('.totp-accounts');
    if (!container) return;

    // Filtrar por búsqueda
    let filtered = state.accounts.filter(account => {
      if (!state.searchQuery) return true;
      const q = state.searchQuery.toLowerCase();
      return account.name.toLowerCase().includes(q) ||
             account.platform.toLowerCase().includes(q);
    });

    // Estado vacío
    if (state.accounts.length === 0) {
      container.innerHTML = `
        <div class="totp-empty">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p>No hay cuentas configuradas</p>
          <button class="totp-empty-btn">Agregar primera cuenta</button>
        </div>
      `;
      setupEmptyButton();
      return;
    }

    // Sin resultados de búsqueda
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="totp-no-results">
          No se encontraron cuentas para "${escapeHtml(state.searchQuery)}"
        </div>
      `;
      return;
    }

    // Renderizar tarjetas
    container.innerHTML = filtered.map((account, idx) => {
      const realIndex = state.accounts.indexOf(account);
      const code = generateTOTP(account);
      const period = account.period || 30;
      const timeLeft = getTimeRemaining(period);
      const progress = (timeLeft / period) * 100;
      const circumference = 2 * Math.PI * 18;
      const offset = circumference - (progress / 100) * circumference;

      let timerClass = '';
      if (timeLeft <= 5) timerClass = 'danger';
      else if (timeLeft <= 10) timerClass = 'warning';

      return `
        <div class="totp-card" data-index="${realIndex}">
          <button class="totp-delete-btn" data-index="${realIndex}" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <div class="totp-card-header">
            <div class="totp-card-info">
              <div class="totp-card-name">${escapeHtml(account.platform)}</div>
              <div class="totp-card-platform">${escapeHtml(account.name)}</div>
            </div>
            <div class="totp-timer">
              <svg class="totp-timer-circle" width="44" height="44" viewBox="0 0 44 44">
                <circle class="totp-timer-bg" cx="22" cy="22" r="18"/>
                <circle class="totp-timer-progress ${timerClass}" cx="22" cy="22" r="18"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${offset}"/>
              </svg>
              <span class="totp-timer-text">${timeLeft}s</span>
            </div>
          </div>
          <div class="totp-code-row">
            <div class="totp-code">${formatCode(code)}</div>
            <button class="totp-copy-btn" data-index="${realIndex}" title="Copiar">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    setupCardButtons();
  }

  // Configurar botones de las tarjetas
  function setupCardButtons() {
    // Clic en tarjeta para copiar
    document.querySelectorAll('.totp-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.totp-delete-btn') || e.target.closest('.totp-copy-btn')) return;
        const index = parseInt(card.dataset.index);
        copyCode(index, card);
      });
    });

    // Botón copiar
    document.querySelectorAll('.totp-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        const card = btn.closest('.totp-card');
        copyCode(index, card, btn);
      });
    });

    // Boton eliminar (confirmacion en dos pasos)
    document.querySelectorAll('.totp-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        handleDeleteClick(btn, index);
      });
    });
  }

  // Configurar botón estado vacío
  function setupEmptyButton() {
    const btn = document.querySelector('.totp-empty-btn');
    if (btn) {
      btn.addEventListener('click', openPopup);
    }
  }

  // Copiar código al portapapeles
  async function copyCode(index, card, btn) {
    const account = state.accounts[index];
    if (!account) return;

    const code = generateTOTP(account).replace(/\s/g, '');

    try {
      await navigator.clipboard.writeText(code);

      // Feedback visual en tarjeta
      card.classList.add('copied');
      setTimeout(() => card.classList.remove('copied'), 2000);

      // Feedback en botón
      if (btn) {
        btn.classList.add('copied');
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        `;
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          `;
        }, 2000);
      }

      // Toast
      showToast('Codigo copiado');
    } catch (err) {
      console.error('Error copying:', err);
      showToast('Error al copiar');
    }
  }

  // Mostrar toast
  function showToast(message) {
    const toast = document.querySelector('.totp-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // Manejar clic en boton eliminar (confirmacion en dos pasos)
  function handleDeleteClick(btn, index) {
    // Si ya esta en modo confirmar, eliminar
    if (btn.classList.contains('confirm')) {
      deleteAccount(index);
      return;
    }

    // Cambiar a modo confirmar
    btn.classList.add('confirm');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14"/>
      </svg>
    `;
    btn.title = 'Confirmar eliminacion';

    // Volver al estado original despues de 3 segundos
    setTimeout(() => {
      if (btn && btn.classList.contains('confirm')) {
        btn.classList.remove('confirm');
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        `;
        btn.title = 'Eliminar';
      }
    }, 3000);
  }

  // Eliminar cuenta
  async function deleteAccount(index) {
    const account = state.accounts[index];
    if (!account) return;

    state.accounts.splice(index, 1);
    await chrome.storage.local.set({ accounts: state.accounts });
    renderAccounts();
  }

  // Abrir popup de la extensión
  function openPopup() {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  }

  // Toggle sidebar
  function toggleSidebar() {
    const container = document.getElementById('totp-sidebar-container');
    if (!container) return;

    state.isOpen = !state.isOpen;
    container.classList.toggle('open', state.isOpen);

    if (state.isOpen) {
      loadAccounts().then(renderAccounts);
      startAutoUpdate();
    } else {
      stopAutoUpdate();
    }
  }

  // Iniciar actualización automática
  function startAutoUpdate() {
    stopAutoUpdate();
    state.updateInterval = setInterval(() => {
      if (state.isOpen) {
        renderAccounts();
      }
    }, 1000);
  }

  // Detener actualización automática
  function stopAutoUpdate() {
    if (state.updateInterval) {
      clearInterval(state.updateInterval);
      state.updateInterval = null;
    }
  }

  // Configurar event listeners
  function setupEventListeners(container) {
    // Toggle button
    const toggleBtn = container.querySelector('.totp-toggle-btn');
    toggleBtn.addEventListener('click', toggleSidebar);

    // Close button
    const closeBtn = container.querySelector('.totp-close-btn');
    closeBtn.addEventListener('click', toggleSidebar);

    // Search input
    const searchInput = container.querySelector('.totp-search-input');
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderAccounts();
    });

    // Add button
    const addBtn = container.querySelector('.totp-add-btn');
    addBtn.addEventListener('click', openPopup);

    // Keyboard shortcut (Ctrl/Cmd + Shift + T)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleSidebar();
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) {
        toggleSidebar();
      }
    });

    // Escuchar cambios en storage
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.accounts) {
        state.accounts = changes.accounts.newValue || [];
        if (state.isOpen) {
          renderAccounts();
        }
      }
    });
  }

  // Inicializar
  async function init() {
    // Cargar OTPAuth si no está disponible
    if (typeof OTPAuth === 'undefined') {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('libs/otpauth-9.1.3.min.js');
      script.onload = () => {
        const container = createSidebar();
        setupEventListeners(container);
        loadAccounts();
      };
      document.head.appendChild(script);
    } else {
      const container = createSidebar();
      setupEventListeners(container);
      await loadAccounts();
    }
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
