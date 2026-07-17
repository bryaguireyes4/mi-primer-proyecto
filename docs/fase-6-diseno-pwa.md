# Fase 6 — Sistema de diseno premium, mobile y PWA

## Alcance entregado

- Tokens de diseno ampliados: paleta dark navy/charcoal (nunca negro
  puro) con acentos dorados, escalas de elevacion neumorficas para dark
  mode (`--relieve-superficie-alta`, `--relieve-boton`,
  `--relieve-hundido`, etc.) y ancho base mobile-first (~430px).
- Componentes (tarjetas, botones, campos, filas de lista) actualizados
  con relieve/3D neumorfico, transiciones sutiles al presionar, y
  touch targets minimos de 44x44px.
- Corregido el layout de filas de listado (gastos, ingresos, deudas,
  usuarios, etc.) para que el texto y los botones de accion no se
  superpongan en pantallas de telefono (~375-390px).
- Contraste de color verificado contra WCAG AA (todas las combinaciones
  texto/fondo del sistema superan 4.5:1; el boton dorado con texto oscuro
  supera 8:1).
- PWA instalable: `manifest.json`, iconos PNG generados (192x192 y
  512x512, sin dependencias externas), metaetiquetas de `apple-touch-icon`
  y `apple-mobile-web-app-capable` en `index.html`.
- Service worker (`public/sw.js`) ampliado con cacheo de la app shell
  (estrategia network-first con fallback a cache) ademas del manejo de
  notificaciones push de la fase 4; se registra automaticamente al
  cargar la aplicacion.

## Archivos creados (frontend)

- `frontend/scripts/generar-iconos.cjs` — genera los iconos PNG de la PWA
  sin dependencias externas (solo `zlib` de Node).
- `public/icono-192.png`, `public/icono-512.png`, `public/manifest.json`

## Archivos modificados (frontend)

- `src/estilos/variables.css` — tokens de elevacion/relieve y ancho base.
- `src/componentes/interfaz.css` — relieve neumorfico y layout responsivo
  de `.fila-usuario`.
- `src/index.css` — ancho maximo desde token, ajustes menores.
- `public/sw.js` — cacheo de app shell.
- `src/principal.jsx` — registro automatico del service worker.
- `index.html` — manifest, iconos y metaetiquetas PWA.

## Verificacion realizada

Se levantaron el backend y el frontend en local y se recorrio con
Playwright (viewport 390x844, tamano de telefono) el flujo completo:
inicio de sesion, registro rapido de gasto con sugerencia de etiqueta,
reportes con graficos, y deudas con la recomendacion mensual. Se
confirmo que `manifest.json` se sirve correctamente y que el layout no
presenta elementos superpuestos en el ancho movil objetivo.
