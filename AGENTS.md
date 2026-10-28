# AGENTS.md

Web estática de Avícola Garcés (distribuidora de pollo, sur de Guayaquil). Lee también `CLAUDE.md`.

## Stack
HTML + CSS + JS plano, sin build ni dependencias. Un solo archivo de cada uno:
`index.html`, `assets/css/styles.v1.css`, `assets/js/main.v1.js`.

## Cómo correr y probar
```bash
python3 -m http.server 8765   # en la raíz del proyecto, luego abrir http://localhost:8765
```
No hay suite de tests. Verificar visualmente en el navegador (capturas en 375×812 y 1280×800).

## Carpetas intocables
- `originales/` — fuentes de las imágenes/video, no se editan ni se sirven.
- `.github/workflows/` — solo si el encargo lo pide explícitamente.
- `docs/` — las actualiza Claude, no Codex.

## Reglas que aplican (de CLAUDE.md y la skill ui-web)
- No inventar datos del negocio (precios, horarios, dirección, etc.).
- Todos los `href` de WhatsApp van completos en el HTML, funcionan sin JS.
- Respetar `prefers-reduced-motion`.
- Una sola fuente de espaciado vertical entre secciones (variable CSS en `:root`, no valores sueltos por sección).
- CSS/JS con nombre versionado: si el archivo cambia mucho, no hace falta subir de versión por un ajuste de espaciado.

## Despliegue
Sin servidor propio todavía (ver `docs/PUBLICAR.md`). No hay credenciales en este repo.

## Lecciones
(vacío por ahora)
