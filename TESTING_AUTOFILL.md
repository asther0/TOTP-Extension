# Guía de Pruebas - Auto-Fill Automático

## Cómo probar el auto-fill de códigos MFA

### 1. Preparar la extensión

1. Recarga la extensión en Chrome:
   - Ve a `chrome://extensions/`
   - Click en el ícono de "Recargar" en la tarjeta de TOTP Authenticator
   - O presiona Ctrl+R con la extensión seleccionada

2. Abre la **Consola de DevTools**:
   - F12 o Click derecho → Inspeccionar
   - Ve a la pestaña "Console"

### 2. Sitios de prueba

Puedes probar en estos sitios comunes que usan MFA:

#### Opción A: GitHub
1. Ve a https://github.com/login
2. Inicia sesión con tu cuenta
3. Cuando te pida el código 2FA:
   - Abre el side panel de TOTP
   - Click en tu cuenta de GitHub
4. **Observa la consola** - deberías ver logs como:
   ```
   [TOTP Autofill] Content script cargado y listo
   [TOTP] Intentando auto-fill...
   [TOTP Autofill] Buscando campo MFA...
   [TOTP Autofill] ✓ Campo encontrado por ID: "otp"
   [TOTP Autofill] ✓ Campo rellenado exitosamente
   ```

#### Opción B: Google
1. Ve a https://accounts.google.com
2. Inicia sesión con 2FA habilitado
3. Cuando pida código de verificación:
   - Abre el side panel
   - Click en tu cuenta de Google
4. Observa la consola

#### Opción C: Página de prueba local
Crea un archivo HTML simple:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test MFA</title>
</head>
<body>
  <h1>Prueba de Auto-Fill MFA</h1>
  <form>
    <label>Código de verificación:</label>
    <input type="text" id="otp" name="otp" placeholder="Ingresa código" maxlength="6">
    <button type="submit">Verificar</button>
  </form>
</body>
</html>
```

### 3. Interpretar los logs

#### ✓ Auto-fill funcionando correctamente:
```
[TOTP] Intentando auto-fill...
[TOTP] Enviando código a tab 123: https://...
[TOTP Autofill] Mensaje recibido para auto-completar
[TOTP Autofill] Buscando campo MFA...
[TOTP Autofill] ✓ Campo encontrado por [ID/NAME/PLACEHOLDER]
[TOTP Autofill] ✓ Campo rellenado exitosamente
[TOTP] ✓ Auto-fill exitoso
```
**Feedback visual:** "✓ Auto-completado"

#### ✗ Campo no encontrado (fallback normal):
```
[TOTP] Intentando auto-fill...
[TOTP Autofill] Buscando campo MFA...
[TOTP Autofill] ✗ No se encontró ningún campo MFA
[TOTP] ✗ Auto-fill falló o campo no encontrado
```
**Feedback visual:** "✓ Copiado" (código en clipboard para Ctrl+V)

#### ✗ Content script no cargado:
```
[TOTP] Intentando auto-fill...
[TOTP] ✗ Auto-fill no disponible: Could not establish connection
```
**Solución:** Recarga la página donde quieres usar el auto-fill

### 4. Campos MFA detectables

El auto-fill detecta campos con:

- **IDs:** `code`, `otp`, `mfa`, `2fa`, `totp`, `token`, `verification`, etc.
- **Names:** Similar a IDs
- **Placeholders:** "enter code", "verification code", "6-digit", etc.
- **Aria-labels:** "verification code", "authentication code", etc.
- **Autocomplete:** `one-time-code`, `otp`
- **MaxLength:** 6-8 caracteres (si no parece campo de contraseña)

### 5. Troubleshooting

#### El auto-fill nunca funciona:
1. Verifica que el content script esté cargado:
   - Abre DevTools en la página
   - Busca en Console: `[TOTP Autofill] Content script cargado`
   - Si no aparece, recarga la página

2. Verifica permisos en `chrome://extensions/`:
   - La extensión debe tener acceso a "Leer y modificar todos tus datos"

#### El campo existe pero no se detecta:
1. Inspecciona el input en DevTools (Click derecho → Inspeccionar)
2. Revisa sus atributos: `id`, `name`, `placeholder`, `aria-label`, `autocomplete`
3. Si no coincide con los patrones, reporta el sitio para agregarlo

#### El campo se rellena pero el sitio no lo reconoce:
- Algunos sitios con validación estricta pueden no aceptar auto-fill programático
- En ese caso, usa el fallback: Ctrl+V

### 6. Sitios conocidos compatibles

✓ GitHub
✓ Google (Gmail, Google Account)
✓ AWS Console
✓ Microsoft (Office 365, Azure)
✓ LinkedIn
✓ Twitter/X
✓ Discord
✓ Facebook

### 7. Reportar problemas

Si encuentras un sitio donde el auto-fill debería funcionar pero no lo hace:

1. Captura los logs de la consola
2. Inspecciona el campo MFA (HTML)
3. Reporta con esta información
