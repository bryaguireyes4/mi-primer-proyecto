# CLAUDE.md · Web de Avícola Garcés

Contexto para Claude Code. Lee también `docs/HISTORIAL.md` (qué se hizo y por qué) y `docs/PENDIENTES.md`.

## El proyecto
Web estática de **Avícola Garcés**, distribuidora de pollo en el sur de Guayaquil, Ecuador.
Objetivo: presentar el negocio, mostrar productos y generar consultas y pedidos por **WhatsApp**.

## Datos confirmados (los únicos que se pueden afirmar)
- Nombre: Avícola Garcés
- WhatsApp: 0963 293 045 → `https://wa.me/593963293045`
- Correo: garcessalasgonzalo@gmail.com
- Eslogan: “Servimos con compromiso, crecemos contigo”
- Ubicación: sur de Guayaquil (sin dirección exacta)
- Productos confirmados: pollo entero, pechuga, presas (piernas, muslos y alas)
- Dominio previsto: `https://avicolag.boacgro.com` (en Cloudflare, zona `boacgro.com`)

## Reglas que no se rompen
- **No inventar**: precios, horarios, dirección, certificaciones, testimonios, años, entregas, cobertura, presentaciones. Lo que falte va como `<!-- PENDIENTE: … -->` en el código, nunca visible.
- **Nada de inversiones, porcentajes, acuerdos entre socios ni sistema interno** en la web.
- Las fotos y el video son **referenciales generados con IA**: nunca presentarlos como fotos reales del local, personal o proceso. La galería solo con fotos reales.
- WhatsApp es la acción principal: visible en el primer pantallazo y al cierre. Todos los `href` de WhatsApp van completos en el HTML (funcionan sin JS).
- Respetar `prefers-reduced-motion` (sin video ni animaciones → foto fija).

## Preferencias del usuario
- Responder en **español**, directo y conciso; sin halagos; corregirlo si se equivoca.
- Cuando preguntes, ofrece **opciones múltiples** (ventana de selección).
- Prefiere que Claude haga el trabajo completo y verifique con capturas.

## Estructura
```
index.html                 página única
assets/css/styles.v1.css   estilos (tokens en :root)
assets/js/main.v1.js       mejoras progresivas (menú, aparición, botón flotante, armador de mensaje, video)
assets/fonts/              Archivo (titulares) + Source Sans 3 (texto), variables, autoalojadas
assets/img/                logo, mascota, fotos de producto, mapa, OG
assets/video/portada-bucle.mp4   video de portada en bucle (sin audio)
robots.txt · sitemap.xml · _headers (Cloudflare) · .htaccess (Apache)
.github/workflows/publicar-cloudflare.yml   publicación automática a Cloudflare Pages
tools/                     scripts de verificación y armado
docs/                      historial, pendientes y guía de publicación
```
Rama de trabajo: `claude/web-avicola-garces` (la web no está en `main`).

## Diseño (resumen)
- Fondos blancos, texto azul casi negro `#0d1625`, acentos del logo: rojo `#f90031` (texto pequeño `#d1002a`), amarillo `#fba409` solo decorativo.
- Tipografías: Archivo (display) + Source Sans 3 (texto). Máximo 2 familias.
- Curva de movimiento tipo iOS: `cubic-bezier(0.32, 0.72, 0, 1)`.
- Portada escritorio (≥1200 px): **tarjeta centrada del ancho del contenido**; texto a la izquierda, video a la derecha con máscara de fundido. Móvil/tableta: video a pantalla completa detrás del texto con velo blanco.
- Video: **bucle infinito sin botón de pausa** (decisión del usuario, aunque WCAG 2.2.2 pide pausa). Se pausa fuera de pantalla y con pestaña oculta.
- Catálogo: 3 tarjetas iguales (5:4). Presentación: texto + mapa del Ecuador recoloreado (pin en Guayaquil) en columnas iguales.
- Tipografía más compacta en móvil (bloque al final del CSS, `max-width: 599px`).

## Cómo verificar cambios
```bash
python3 -m http.server 8765          # en la raíz del proyecto
node tools/capturas.js ./capturas    # 375×812, 812×375, 768×1024, 1280×800 (+ movimiento reducido)
node tools/zoom.js ./capturas        # simula zoom 25 %–200 % en pantalla de 1920 px
```
Requiere Playwright (`npm i -D playwright` y `npx playwright install chromium` en tu PC).
Revisa: sin scroll horizontal, CTA de WhatsApp en el primer pantallazo, portada centrada en todo zoom.

## Publicar
Ver `docs/PUBLICAR.md`. Estado: **aún no publicada**. El flujo de Cloudflare espera los secretos de GitHub `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.

## Convenciones
- CSS/JS con nombre versionado (`styles.v1.css`, `main.v1.js`): si cambian mucho y hay caché larga, subir a v2 y actualizar `index.html`.
- Comentarios y textos en español. Commits en español, en imperativo.
