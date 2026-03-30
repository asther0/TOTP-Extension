# Demo de Login con 2FA

Sistema de demostración para probar la extensión TOTP Authenticator.

## 🚀 Inicio Rápido

1. **Abrir el demo**: Abre `demo/index.html` en tu navegador
2. **Configurar 2FA**: Ve a "Configurar 2FA" y escanea el QR con la extensión
3. **Probar login**: Ve a "Iniciar Sesión" y prueba el auto-completado

## 📁 Estructura

```
demo/
├── index.html       # Página principal con opciones
├── setup.html       # Configuración de 2FA (muestra QR)
├── login.html       # Formulario de login con MFA
├── dashboard.html   # Dashboard después del login exitoso
└── README.md        # Este archivo
```

## 🔑 Credenciales de Demo

- **Email**: demo@example.com
- **Password**: demo123
- **TOTP Secret**: JBSWY3DPEHPK3PXP

## ✨ Características

### Setup (setup.html)
- Genera código QR para escanear
- Muestra el secreto TOTP para ingreso manual
- Opción de copiar el secreto
- Instrucciones paso a paso

### Login (login.html)
- Formulario de email y contraseña
- Campo de código MFA (6 dígitos)
- **Auto-detección**: Cuando el campo MFA se completa, se envía automáticamente
- Validación simple de credenciales
- Feedback visual durante el proceso

### Dashboard (dashboard.html)
- Confirmación de login exitoso
- Muestra el email del usuario
- Explicación del flujo que se ejecutó
- Opción de logout

## 🎯 Flujo de Uso

1. **Primera vez**:
   - Ir a `setup.html`
   - Escanear QR con la extensión TOTP
   - Anotar las credenciales de demo

2. **Login**:
   - Ir a `login.html`
   - Ingresar email y contraseña (o usar botón "credenciales de demo")
   - La extensión detectará el campo MFA y lo completará automáticamente
   - El formulario se enviará solo cuando el código esté completo

3. **Dashboard**:
   - Verás confirmación del login exitoso
   - Puedes cerrar sesión y probar de nuevo

## 🎨 Diseño

- Inspirado en interfaces de Vercel y Google
- Uso de Tailwind CSS para estilos modernos
- Responsive y accesible
- Transiciones suaves y feedback visual

## 🔧 Notas Técnicas

- **Sin backend**: Todo funciona en el frontend
- **Validación simple**: Cualquier código de 6 dígitos es válido
- **Session storage**: Para simular autenticación
- **Auto-submit**: Se activa 500ms después de completar el código MFA

## 📝 Para Testing

El demo es perfecto para:
- Demostrar el valor de la extensión
- Probar el auto-completado de códigos MFA
- Mostrar la experiencia de usuario
- Validar la detección de campos

## ⚠️ Advertencias

- Este es un **demo sin seguridad real**
- No usar en producción
- Credenciales hardcodeadas
- Sin encriptación ni protección

## 🎬 Demo Script

1. Abre la extensión y muestra que está vacía
2. Ve a `setup.html` y escanea el QR
3. Verifica que se agregó la cuenta en la extensión
4. Ve a `login.html`
5. Ingresa email y contraseña
6. **Momento clave**: Abre el side panel de la extensión
7. El código MFA se completará automáticamente
8. Observa cómo el formulario se envía solo
9. ¡Bienvenido al dashboard!
