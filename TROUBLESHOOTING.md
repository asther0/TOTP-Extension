# Solución de Problemas

## Error: "Service worker registration failed. Status code: 15"

**Causa**: Error en el archivo `background.js` o permisos insuficientes.

**Solución**:
1. Asegúrate de que el archivo `background/background.js` existe
2. Verifica que el manifest.json tenga la ruta correcta: `"service_worker": "background/background.js"`
3. En Chrome, ve a `chrome://extensions/` y haz clic en "Recargar" en la extensión

## Error: "Uncaught ReferenceError: browser is not defined"

**Causa**: El código intentaba usar la API `browser` que no existe en Chrome.

**Solución**: Este error ya fue corregido en la versión actual. Si aún lo ves:
1. Asegúrate de usar la versión más reciente del código
2. Verifica que `background.js` use `typeof browser === 'undefined'` en lugar de `!browser`

## La extensión no abre nada al hacer clic

**Causa**: Conflicto entre `onClicked.addListener` y `setPanelBehavior`.

**Solución**: Este error ya fue corregido. Si persiste:
1. Desinstala completamente la extensión en Chrome
2. Cierra Chrome completamente
3. Vuelve a cargar la extensión desde `chrome://extensions/`
4. Habilita "Modo de desarrollador"
5. Carga la extensión sin empaquetar

## Pasos para cargar la extensión correctamente en Chrome

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el "Modo de desarrollador" (esquina superior derecha)
3. Haz clic en "Cargar extensión sin empaquetar"
4. Selecciona la carpeta del proyecto `TOTP-Extension`
5. La extensión debería aparecer en la lista
6. Haz clic en el ícono de la extensión en la barra de herramientas

## Verificar que funcione correctamente

1. Al hacer clic en el ícono de la extensión, debe abrirse un panel lateral (side panel) a la derecha
2. Deberías ver la interfaz "Cuentas" con el botón "+ Agregar cuenta"
3. El botón de configuración (engranaje) debe estar visible en la esquina superior derecha

## Diferencias entre navegadores

- **Chrome**: Usa Side Panel (panel lateral)
- **Firefox/Safari**: Usaría popup (ventana emergente)

Esta extensión está optimizada para Chrome usando el Side Panel API.
