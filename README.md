# 🔐 TOTP Authenticator Extension

Extensión de navegador (Chrome/Safari) que funciona como espejo de tu autenticador móvil, permitiéndote copiar códigos MFA directamente sin necesidad de desbloquear tu celular.

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

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una sugerencia:

1. Abre un issue
2. Crea un fork del proyecto
3. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
4. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
5. Push a la rama: `git push origin feature/nueva-funcionalidad`
6. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## ⚠️ Disclaimer

Esta extensión es una herramienta de conveniencia y debe usarse como complemento, no como reemplazo de tu autenticador móvil principal. Mantén siempre un método de respaldo para acceder a tus códigos MFA.

## 🙏 Créditos

- **OTPAuth.js**: [Librería TOTP/HOTP](https://github.com/hectorm/otpauth)
- Basado en el proyecto [totp-generator](../totp-generator/)

---

Hecho con ❤️ para facilitar tu workflow diario
