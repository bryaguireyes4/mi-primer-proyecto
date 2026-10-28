# Historial del proyecto

Resumen de lo construido y las decisiones tomadas (octubre 2026), en orden.

## 1. Primera versión
- Sitio estático (HTML + CSS + JS sin dependencias). Secciones: portada, presentación, catálogo, cómo pedir (con armador de mensaje de WhatsApp), galería (oculta hasta tener fotos reales), contacto y pie.
- Logo del cliente: fondo quitado, versiones WebP; la mascota recortada se usa en el encabezado junto al nombre en texto.
- Fuentes autoalojadas desde npm (@fontsource-variable/archivo y source-sans-3).
- Higgsfield no permitió generar imágenes ni video (plan gratis, créditos insuficientes). Se entregaron prompts y el usuario generó todo con **Gemini**.
- Elemento firma: botones “Añadir al mensaje” en cada producto que arman el texto de WhatsApp en vivo.

## 2. Imágenes de Gemini
- Fotos de producto (pollo entero, pechuga, piernas, alas) en plato sobre fondo beige; “Presas” combina piernas + alas lado a lado.
- Foto panorámica de tres platos: respaldo de la portada (sin video o con movimiento reducido).
- Todo marcado en la web como “Imágenes referenciales”.

## 3. Portada con video
- Video de Gemini (pechuga cayendo sobre mármol, 10 s, 1280×720). Se quitó el audio.
- Primero se reproducía una vez; luego se pidió **bucle infinito**: se fundió el último 1,25 s con el inicio (ffmpeg `xfade`) → `assets/video/portada-bucle.mp4` (8,75 s, ~676 KB). Ver `tools/video-bucle.sh`.
- Se intentó un video nuevo “cinemagraph”; al usuario no le gustó y se quedó con el original en bucle.
- Luego se **quitó el botón de pausa** a pedido del usuario.

## 4. Presentación con mapa
- El usuario pidió un mapa del Ecuador con pin en Guayaquil. Gemini dio un mapa 3D oscuro con relieve; se recoloreó en Python a la paleta de la web, se dejó solo el Ecuador con transparencia y el pin, y se le agregó un pulso CSS bajo la punta (`.map-pulse`, coordenadas en % de la imagen: left 19.7 %, top 51 %).
- Ajustado a columnas iguales para que el mapa tenga el mismo peso que el texto.

## 5. Ajustes de diseño
- Catálogo: tarjetas del mismo tamaño.
- Móvil: video detrás del texto con velo blanco; tipografía más compacta.
- Celular horizontal: se usa el botón de WhatsApp del encabezado (el flotante tapaba texto).
- Zoom del navegador: la portada se descuadraba porque el video era más ancho que el contenido. Solución final: en escritorio la portada es una **tarjeta del mismo ancho que el contenido**, alineada con el logo y el botón de WhatsApp del encabezado. Verificado de 25 % a 200 % (`tools/zoom.js`).

## 6. Publicación
- Vista previa privada como artefacto de Claude (solo visible para el usuario).
- Vercel y Cloudflare estaban bloqueados desde el entorno de nube de Claude.
- Se creó `.github/workflows/publicar-cloudflare.yml`: crea el proyecto `avicolag` en Cloudflare Pages, publica, agrega `avicolag.boacgro.com` y su CNAME. Falta que el usuario guarde los secretos en GitHub.
- Meta etiquetas, JSON-LD, robots y sitemap ya apuntan a `https://avicolag.boacgro.com`.

## 7. Vista previa como artefacto de Claude (desde Claude Code)
- Se publicó el sitio completo (`index.html` + `assets/`) como artefacto de Claude para compartir un link sin esperar la publicación en Cloudflare: https://claude.ai/artifact/6wPb24kn361HcpUUkV28RZ
- El artefacto nace **privado**: solo lo abre el dueño hasta que active "Anyone with the link" en el menú Share de la página. Quien lo abre sin ese cambio (o sin sesión) ve solo una vista previa borrosa, sin texto ni video.
- Reporte del usuario: "en teléfono no carga el video". Dos causas posibles, no excluyentes:
  1. El artefacto seguía privado (causa más probable).
  2. El video se desactiva a propósito en `assets/js/main.v1.js` (bloque "Video de portada") si el navegador tiene `connection.saveData` activo (ahorro de datos), `prefers-reduced-motion: reduce`, o hardware de gama baja (`hardwareConcurrency <= 2` o `deviceMemory <= 2`). En esos casos se ve la foto fija, es comportamiento esperado, no un bug.
- Nota técnica de entorno: al extraer el zip del proyecto en una ruta de `%TEMP%` muy anidada, algunos archivos (sobre todo `assets/img/productos/*`) devolvían 404 en el servidor local aunque existían, por superar el límite de 260 caracteres de ruta en Windows (MAX_PATH). Se resolvió copiando el proyecto a una ruta corta antes de servir/publicar. Si vuelve a pasar: acortar la ruta, no el nombre de los archivos.
