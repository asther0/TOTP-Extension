# Guía de Contribución

¡Gracias por tu interés en contribuir a TOTP Authenticator! 🎉

## Cómo Contribuir

### Reportar Bugs

Si encuentras un bug:

1. **Verifica** que no exista un issue similar
2. **Abre un nuevo issue** con:
   - Título descriptivo
   - Pasos para reproducir el bug
   - Comportamiento esperado vs comportamiento actual
   - Versión del navegador y sistema operativo
   - Screenshots si aplica

### Sugerir Mejoras

Para sugerir nuevas funcionalidades:

1. **Abre un issue** con la etiqueta "enhancement"
2. **Describe** claramente:
   - El problema que resuelve
   - Cómo beneficiaría a los usuarios
   - Posible implementación (opcional)

### Pull Requests

#### Proceso

1. **Fork** el repositorio
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```
3. **Implementa** tus cambios
4. **Commit** con mensajes descriptivos:
   ```bash
   git commit -m "Add: descripción clara del cambio"
   ```
5. **Push** a tu fork:
   ```bash
   git push origin feature/nombre-descriptivo
   ```
6. **Abre un Pull Request** hacia `main`

#### Convenciones de Código

**JavaScript:**
- Usa `const` y `let`, evita `var`
- Nombra variables y funciones de forma descriptiva
- Agrega JSDoc a funciones públicas
- Maneja errores explícitamente
- Evita código duplicado

```javascript
/**
 * Genera un código TOTP para una cuenta
 * @param {Object} account - Configuración de la cuenta
 * @returns {string} - Código TOTP generado
 */
function generateTOTP(account) {
  // Implementación
}
```

**CSS:**
- Usa variables CSS para colores y valores reutilizables
- Sigue la estructura BEM cuando sea apropiado
- Mantén la consistencia con los estilos existentes
- Agrupa propiedades relacionadas

**HTML:**
- Usa HTML5 semántico
- Incluye ARIA labels para accesibilidad
- Valida con W3C Validator

#### Commits

Usa prefijos descriptivos:
- `Add:` - Nueva funcionalidad
- `Fix:` - Corrección de bugs
- `Update:` - Mejora de código existente
- `Refactor:` - Reestructuración sin cambio funcional
- `Docs:` - Cambios en documentación
- `Style:` - Cambios de formato (no afectan funcionalidad)
- `Test:` - Agregar o modificar tests
- `Perf:` - Mejoras de rendimiento

Ejemplo:
```
Add: search functionality for accounts

- Search bar appears when > 3 accounts
- Real-time filtering by name or platform
- Clear search button
```

### Testing

Antes de enviar tu PR, verifica:

- [ ] La extensión carga sin errores en Chrome
- [ ] Todas las funcionalidades existentes siguen funcionando
- [ ] Tu nueva funcionalidad funciona como se espera
- [ ] No hay errores en la consola del navegador
- [ ] El código sigue las convenciones del proyecto
- [ ] Has probado en modo claro y oscuro
- [ ] La interfaz se ve bien en diferentes tamaños

### Áreas que Necesitan Contribución

#### Alta Prioridad
- 🎥 **Escaneo de QR**: Implementar jsQR para escanear códigos QR
- 🔒 **Seguridad**: Auditoría de seguridad y encriptación mejorada
- 🧪 **Tests**: Agregar suite de tests automatizados
- 🍎 **Safari**: Mejorar compatibilidad con Safari

#### Media Prioridad
- ✏️ **Editar cuentas**: Permitir modificar cuentas existentes
- 🏷️ **Categorías**: Sistema de etiquetas/categorías
- 📊 **Estadísticas**: Tracking de uso (opcional, con privacidad)
- 🌐 **i18n**: Internacionalización (inglés, español, etc.)

#### Baja Prioridad
- 🎨 **Temas personalizados**: Más opciones de personalización
- ⚡ **Atajos de teclado**: Shortcuts globales
- 📱 **Diseño responsive**: Optimizar para diferentes tamaños
- 🔔 **Notificaciones**: Alertas opcionales

## Estructura del Código

### popup/popup.js

Organizado en secciones:
1. **Estado global** - `appState` object
2. **Inicialización** - `initializeApp()` y setup
3. **Storage** - `loadAccounts()`, `saveAccounts()`
4. **Renderizado** - `renderAccounts()` y helpers
5. **Generación TOTP** - `generateTOTP()` y algoritmos
6. **Event handlers** - Click, submit, etc.
7. **Utilidades** - Validación, formateo, etc.

### popup/popup.css

Organizado en secciones:
1. **Variables CSS** - `:root` y `.dark-theme`
2. **Base** - Reset y estilos generales
3. **Layout** - Header, container, etc.
4. **Components** - Cards, buttons, forms, etc.
5. **Utilities** - `.hidden`, etc.

## Recursos Útiles

### TOTP/OTP
- [RFC 6238 - TOTP](https://datatracker.ietf.org/doc/html/rfc6238)
- [RFC 4226 - HOTP](https://datatracker.ietf.org/doc/html/rfc4226)
- [OTPAuth Library](https://github.com/hectorm/otpauth)

### Chrome Extensions
- [Manifest V3 Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

### Accesibilidad
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

## Código de Conducta

Este proyecto sigue el [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).

### Nuestros Compromisos

- Ser respetuoso con todos los contribuidores
- Aceptar críticas constructivas
- Enfocarse en lo mejor para la comunidad
- Mostrar empatía hacia otros miembros

### Comportamiento Inaceptable

- Lenguaje o imágenes sexualizadas
- Trolling, insultos o ataques personales
- Acoso público o privado
- Publicar información privada de otros sin permiso

## Preguntas

Si tienes preguntas, puedes:
- Abrir un issue con la etiqueta "question"
- Contactar a los maintainers

---

¡Esperamos tus contribuciones! 🚀
