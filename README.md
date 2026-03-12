# 🔐 TOTP Authenticator Extension

[![GitHub release](https://img.shields.io/github/v/release/asther0/TOTP-Extension?include_prereleases)](https://github.com/asther0/TOTP-Extension/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/asther0/TOTP-Extension)](https://github.com/asther0/TOTP-Extension/issues)
[![GitHub stars](https://img.shields.io/github/stars/asther0/TOTP-Extension)](https://github.com/asther0/TOTP-Extension/stargazers)

Extensión de navegador (Chrome/Safari) que funciona como espejo de tu autenticador móvil, permitiéndote copiar códigos MFA directamente sin necesidad de desbloquear tu celular.

**[Ver en GitHub](https://github.com/asther0/TOTP-Extension)** | **[Reportar Bug](https://github.com/asther0/TOTP-Extension/issues)** | **[Solicitar Feature](https://github.com/asther0/TOTP-Extension/issues)**

## ✨ Características

- 🚀 **Acceso Rápido**: Genera códigos TOTP instantáneamente desde tu navegador
- 📋 **Copiar con un Clic**: Copia códigos directamente al portapapeles
- ✍️ **Entrada Manual**: Agrega cuentas ingresando la clave secreta manualmente
- 📷 **Escaneo QR**: Escanea códigos QR directamente desde la extensión (próximamente)
- 🎨 **UI Moderna**: Interfaz limpia y elegante con animaciones suaves
- ⏱️ **Actualización en Tiempo Real**: Los códigos se actualizan automáticamente
- 🔒 **Almacenamiento Seguro**: Tus claves se guardan localmente en tu navegador
- 🌐 **Multiplataforma**: Compatible con Windows y macOS

## 🛠️ Tecnologías

- **Manifest V3**: Última versión del sistema de extensiones de Chrome
- **OTPAuth.js**: Librería robusta para generación de códigos TOTP
- **Vanilla JavaScript**: Sin frameworks pesados, rápido y eficiente
- **CSS Moderno**: Variables CSS, Grid, Flexbox, animaciones

## 📦 Instalación

### Chrome/Edge/Brave (Windows/macOS)

1. Clona o descarga este repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo de desarrollador" (esquina superior derecha)
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta `TOTP-Extension`

### Safari (macOS)

1. Abre Safari → Preferencias → Avanzado
2. Marca "Mostrar el menú Desarrollo en la barra de menús"
3. Ve a Desarrollo → Permitir extensiones sin firmar
4. Safari → Preferencias → Extensiones
5. Activa "TOTP Authenticator"

## 🚀 Uso

### Agregar una Cuenta Manualmente

1. Haz clic en el ícono de la extensión
2. Selecciona "Agregar Cuenta" o "Agregar Primera Cuenta"
3. Elige la pestaña "✍️ Manual"
4. Completa el formulario:
   - **Nombre**: Ej. "Google", "GitHub", "AWS"
   - **Plataforma**: Ej. "Gmail personal", "Trabajo", "Proyecto X"
   - **Clave Secreta**: El código Base32 que te proporciona la plataforma
   - **Dígitos**: Usualmente 6 (algunos servicios usan 7 u 8)
   - **Período**: Usualmente 30 segundos
   - **Algoritmo**: Usualmente SHA1
5. Haz clic en "Guardar Cuenta"

### Copiar un Código

- **Opción 1**: Haz clic en el botón "Copiar" de la cuenta
- **Opción 2**: Haz clic en cualquier parte de la tarjeta de la cuenta
- El código se copiará automáticamente y verás confirmación visual

### Eliminar una Cuenta

1. Haz clic en el ícono de basura (🗑️) en la esquina superior derecha de la tarjeta
2. Confirma la eliminación

## 🔑 ¿Dónde Encuentro la Clave Secreta?

Cuando configuras autenticación de dos factores en un servicio:

1. El servicio te mostrará un **código QR**
2. Usualmente hay una opción que dice "**¿No puedes escanear? Ingresar clave manualmente**"
3. Al hacer clic ahí, verás una **cadena alfanumérica** (la clave secreta en Base32)
4. Esa es la clave que debes ingresar en esta extensión

Ejemplo de clave: `JBSWY3DPEHPK3PXP` o `GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ`

## ❓ Preguntas Frecuentes (FAQ)

### ¿Es seguro almacenar mis claves en la extensión?

Sí, todas las claves se almacenan **localmente** en tu navegador usando la Chrome Storage API. Nunca se envían a ningún servidor externo. Sin embargo, es importante que:
- Mantengas tu computadora segura y actualizada
- Uses autenticación en tu sistema operativo
- Mantengas un respaldo de tus claves (función de exportar)

### ¿Puedo usar esta extensión sin internet?

¡Absolutamente! La extensión funciona **completamente offline**. Los códigos TOTP se generan localmente usando tu reloj del sistema. No necesitas conexión a internet en ningún momento.

### ¿Qué hago si pierdo mis códigos?

Siempre debes mantener un método de respaldo:
1. Guarda las claves secretas originales en un lugar seguro
2. Usa la función de **Exportar** para crear respaldos periódicos
3. Configura métodos de recuperación en los servicios (email, SMS, códigos de recuperación)

### ¿Por qué los códigos son diferentes a los de mi celular?

Esto puede pasar si:
- **Reloj desincronizado**: Asegúrate de que la hora de tu computadora esté correcta
- **Zona horaria incorrecta**: Verifica la configuración de zona horaria
- **Configuración diferente**: Verifica que uses los mismos parámetros (algoritmo, dígitos, período)

### ¿Puedo sincronizar entre dispositivos?

Actualmente no hay sincronización automática. Sin embargo, puedes:
1. Exportar tus cuentas en un dispositivo
2. Importar el archivo en otro dispositivo
3. (Próximamente se agregará sincronización encriptada opcional)

### ¿Funciona con Google Authenticator, Authy, etc.?

Sí, esta extensión es **compatible con cualquier servicio que use TOTP**:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- LastPass Authenticator
- Y cualquier otro que siga el estándar RFC 6238

### ¿Puedo editar una cuenta después de agregarla?

Actualmente, para modificar una cuenta debes:
1. Eliminar la cuenta existente
2. Agregar una nueva con la información correcta
(La funcionalidad de edición se agregará en una futura versión)

### ¿Por qué la barra de progreso se pone roja?

La barra se vuelve roja cuando quedan **menos de 10 segundos** antes de que el código cambie. Esto te da una advertencia visual para que copies el código antes de que expire.

### ¿Puedo usar esto en Safari?

Sí, la extensión está diseñada para ser compatible con Safari en macOS. Sigue las instrucciones de instalación específicas para Safari en la sección de instalación.

### ¿Consume muchos recursos?

No, la extensión está **optimizada para bajo consumo**:
- Throttling de renders (máximo 10 por segundo)
- Actualizaciones inteligentes (solo cuando es necesario)
- Sin conexiones de red
- Código JavaScript eficiente
- CSS optimizado con variables

### ¿Qué pasa si borro el navegador o extensión?

Si borras la extensión o los datos del navegador, **perderás todas las cuentas guardadas**. Por eso es crucial:
1. Hacer respaldos regulares (botón Exportar)
2. Mantener las claves secretas originales
3. No depender únicamente de esta extensión

## 🎨 Capturas de Pantalla

_Próximamente_

## 🔐 Seguridad

- ✅ Todas las claves se almacenan **localmente** en tu navegador
- ✅ No se envía ninguna información a servidores externos
- ✅ El código es open source y auditable
- ⚠️ **Importante**: Esta extensión es para conveniencia. Mantén también tu autenticador móvil como respaldo
- ⚠️ No compartas tus claves secretas con nadie

## 📝 Algoritmo TOTP

Esta extensión implementa el estándar **RFC 6238 (TOTP: Time-Based One-Time Password)**:

1. Toma la clave secreta compartida (en Base32)
2. Obtiene el timestamp actual en segundos
3. Calcula el contador: `timestamp / período` (usualmente 30s)
4. Genera un HMAC-SHA1 (o SHA256/SHA512) del contador usando la clave
5. Extrae un código de 6-8 dígitos del hash resultante
6. El código cambia cada período (30 segundos)

## 🗂️ Estructura del Proyecto

```
TOTP-Extension/
├── manifest.json           # Configuración de la extensión
├── popup/
│   ├── popup.html         # Interfaz del popup
│   ├── popup.css          # Estilos modernos
│   └── popup.js           # Lógica de la UI
├── background/
│   └── background.js      # Service worker
├── libs/
│   └── otpauth-9.1.3.min.js  # Librería TOTP
├── icons/                 # Íconos de la extensión
└── README.md
```

## 🛣️ Roadmap

- [x] Generación básica de códigos TOTP
- [x] Interfaz moderna con UX mejorada
- [x] Almacenamiento persistente de cuentas
- [x] Copiar al portapapeles con un clic
- [x] Barra de progreso de tiempo
- [x] Eliminación de cuentas
- [ ] Escaneo de códigos QR con cámara
- [ ] Exportar/importar cuentas (con encriptación)
- [ ] Búsqueda de cuentas
- [ ] Categorías/etiquetas
- [ ] Temas (claro/oscuro)
- [ ] Sincronización entre dispositivos (opcional, con encriptación)
- [ ] Soporte para HOTP (Counter-based OTP)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee nuestra [Guía de Contribución](CONTRIBUTING.md) para más detalles.

Proceso rápido:

1. [Abre un issue](https://github.com/asther0/TOTP-Extension/issues) o comenta en uno existente
2. Fork el proyecto en GitHub
3. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
4. Commit: `git commit -m 'Add: nueva funcionalidad'`
5. Push: `git push origin feature/nueva-funcionalidad`
6. [Abre un Pull Request](https://github.com/asther0/TOTP-Extension/pulls)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## ⚠️ Disclaimer

Esta extensión es una herramienta de conveniencia y debe usarse como complemento, no como reemplazo de tu autenticador móvil principal. Mantén siempre un método de respaldo para acceder a tus códigos MFA.

## 🙏 Créditos

- **OTPAuth.js**: [Librería TOTP/HOTP](https://github.com/hectorm/otpauth)
- Basado en el proyecto [totp-generator](../totp-generator/)

---

Hecho con ❤️ para facilitar tu workflow diario
