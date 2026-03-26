/**
 * Content Script - Auto-fill MFA codes
 */

// Patrones comunes para identificar campos MFA
const MFA_PATTERNS = {
  ids: [
    'code', 'otp', 'mfa', '2fa', 'totp', 'token', 'verification',
    'auth-code', 'authcode', 'authenticator', 'twofa', 'two-factor',
    'verify', 'security-code', 'securitycode', 'pin'
  ],
  names: [
    'code', 'otp', 'mfa', '2fa', 'totp', 'token', 'verification',
    'auth-code', 'authcode', 'authenticator', 'twofa', 'two-factor',
    'verify', 'security-code', 'securitycode', 'pin', 'otpCode'
  ],
  placeholders: [
    'code', 'otp', 'mfa', '2fa', 'totp', 'token', 'verification',
    'enter code', 'enter your code', 'authentication code',
    'verification code', 'security code', '6-digit', 'six digit'
  ],
  ariaLabels: [
    'code', 'otp', 'mfa', '2fa', 'totp', 'verification code',
    'authentication code', 'security code'
  ]
};

/**
 * Busca campos de MFA en la página
 */
function findMfaField() {
  console.log('[TOTP Autofill] Buscando campo MFA...');

  // Buscar inputs de texto/número/tel que estén visibles
  const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="number"], input[type="tel"], input:not([type])'));
  console.log(`[TOTP Autofill] Encontrados ${inputs.length} inputs en la página`);

  for (const input of inputs) {
    // Verificar si el input está visible
    const rect = input.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 &&
                     window.getComputedStyle(input).visibility !== 'hidden' &&
                     window.getComputedStyle(input).display !== 'none';

    if (!isVisible) continue;

    const id = (input.id || '').toLowerCase();
    const name = (input.name || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
    const className = (input.className || '').toLowerCase();
    const autocomplete = (input.autocomplete || '').toLowerCase();

    // Verificar patrones en ID
    if (MFA_PATTERNS.ids.some(pattern => id.includes(pattern))) {
      console.log(`[TOTP Autofill] ✓ Campo encontrado por ID: "${id}"`);
      return input;
    }

    // Verificar patrones en name
    if (MFA_PATTERNS.names.some(pattern => name.includes(pattern))) {
      console.log(`[TOTP Autofill] ✓ Campo encontrado por NAME: "${name}"`);
      return input;
    }

    // Verificar patrones en placeholder
    if (MFA_PATTERNS.placeholders.some(pattern => placeholder.includes(pattern))) {
      console.log(`[TOTP Autofill] ✓ Campo encontrado por PLACEHOLDER: "${placeholder}"`);
      return input;
    }

    // Verificar patrones en aria-label
    if (MFA_PATTERNS.ariaLabels.some(pattern => ariaLabel.includes(pattern))) {
      console.log(`[TOTP Autofill] ✓ Campo encontrado por ARIA-LABEL: "${ariaLabel}"`);
      return input;
    }

    // Verificar autocomplete="one-time-code"
    if (autocomplete === 'one-time-code' || autocomplete === 'otp') {
      console.log(`[TOTP Autofill] ✓ Campo encontrado por AUTOCOMPLETE: "${autocomplete}"`);
      return input;
    }

    // Verificar patrones en className
    if (className.includes('otp') || className.includes('mfa') ||
        className.includes('2fa') || className.includes('totp') ||
        className.includes('verification')) {
      return input;
    }

    // Verificar si el input tiene longitud máxima de 6-8 (típico de códigos MFA)
    const maxLength = parseInt(input.maxLength);
    if (maxLength >= 6 && maxLength <= 8) {
      // Verificar que no sea un campo de contraseña común
      if (!id.includes('pass') && !name.includes('pass') &&
          !id.includes('user') && !name.includes('user')) {
        return input;
      }
    }
  }

  console.log('[TOTP Autofill] ✗ No se encontró ningún campo MFA en la página');
  return null;
}

/**
 * Rellena el campo MFA con el código
 */
function fillMfaField(field, code) {
  if (!field) return false;

  try {
    console.log(`[TOTP Autofill] Rellenando campo con código: ${code}`);

    // Enfocar el campo
    field.focus();

    // Establecer el valor
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;
    nativeInputValueSetter.call(field, code);

    // Disparar eventos para que frameworks como React detecten el cambio
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

    // Opcional: quitar foco después de un momento
    setTimeout(() => {
      field.blur();
    }, 100);

    console.log('[TOTP Autofill] ✓ Campo rellenado exitosamente');
    return true;
  } catch (e) {
    console.error('[TOTP Autofill] ✗ Error rellenando campo:', e);
    return false;
  }
}

/**
 * Escuchar mensajes del background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'autofillMfa') {
    console.log('[TOTP Autofill] Mensaje recibido para auto-completar');

    const field = findMfaField();

    if (field) {
      const success = fillMfaField(field, message.code);
      sendResponse({ success: true, filled: success });
    } else {
      console.log('[TOTP Autofill] Respondiendo con error: campo no encontrado');
      sendResponse({ success: false, error: 'No se encontró campo MFA' });
    }
  }

  return true; // Mantener el canal abierto para respuesta asíncrona
});

console.log('[TOTP Autofill] Content script cargado y listo');
