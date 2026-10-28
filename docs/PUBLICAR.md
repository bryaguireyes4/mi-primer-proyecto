# Cómo publicar

La web es estática: se publica la raíz del proyecto (`index.html`, `assets/`, `robots.txt`, `sitemap.xml`, `_headers`). No hay paso de build.

## Opción A · Cloudflare Pages automático (GitHub Actions)
1. Cloudflare → My Profile → API Tokens → Create Custom Token, con permisos:
   - Account › Cloudflare Pages › Edit
   - Zone › DNS › Edit y Zone › Zone › Read (zona `boacgro.com`)
2. GitHub → Settings → Secrets and variables → Actions → crear `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
3. GitHub → Actions → “Publicar en Cloudflare Pages” → Run workflow (rama `main`).
   Después, cada push a `main` publica solo.

## Opción B · Cloudflare Pages a mano
1. dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets.
2. Proyecto `avicolag`; arrastra una carpeta con los archivos públicos.
3. Custom domains → `avicolag.boacgro.com` (el DNS se crea solo).

Con terminal: `npx wrangler pages deploy <carpeta> --project-name=avicolag`

## Opción C · Vercel
- Importar: https://vercel.com/new/import?s=https://github.com/bryaguireyes4/mi-primer-proyecto
  Framework “Other”, sin build. La web está en `main`, así que publica a la primera.
- O desde la PC, en la carpeta del sitio: `npx vercel` y luego `npx vercel --prod`.
- Dominio: Settings → Domains → `avicolag.boacgro.com`; en Cloudflare, CNAME `avicolag` → `cname.vercel-dns.com`, nube gris (DNS only).

## Opción D · Servidor Apache
Subir los archivos públicos a la carpeta pública; `.htaccess` ya trae compresión, caché y bloqueo de archivos internos.

## Opción E · Vista previa rápida (artefacto de Claude)
No es publicación real, solo un link temporal para que el cliente vea el avance sin esperar al dominio.
- Link: https://claude.ai/artifact/6wPb24kn361HcpUUkV28RZ
- Nace privado: abrir la página en claude.ai → menú Share → activar "Anyone with the link" para que cualquiera lo abra sin iniciar sesión. Sin ese paso, solo lo ve el dueño; cualquier otra persona ve una vista borrosa, sin texto ni video.
- Se actualiza volviendo a publicar el mismo `index.html` desde Claude Code (misma URL, nueva versión).

## Si cambia el dominio
Actualizar `https://avicolag.boacgro.com` en `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt` y `sitemap.xml`.
