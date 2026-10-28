# Cómo publicar

La web es estática: se publica la raíz del proyecto (`index.html`, `assets/`, `robots.txt`, `sitemap.xml`, `_headers`). No hay paso de build.

## Opción A · Cloudflare Pages automático (GitHub Actions)
1. Cloudflare → My Profile → API Tokens → Create Custom Token, con permisos:
   - Account › Cloudflare Pages › Edit
   - Zone › DNS › Edit y Zone › Zone › Read (zona `boacgro.com`)
2. GitHub → Settings → Secrets and variables → Actions → crear `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
3. GitHub → Actions → “Publicar en Cloudflare Pages” → Run workflow (rama `claude/web-avicola-garces`).
   Después, cada push a esa rama publica solo.

## Opción B · Cloudflare Pages a mano
1. dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets.
2. Proyecto `avicolag`; arrastra una carpeta con los archivos públicos.
3. Custom domains → `avicolag.boacgro.com` (el DNS se crea solo).

Con terminal: `npx wrangler pages deploy <carpeta> --project-name=avicolag`

## Opción C · Vercel
- Importar: https://vercel.com/new/import?s=https://github.com/bryaguireyes4/mi-primer-proyecto
  Framework “Other”, sin build. Cambiar Production Branch a `claude/web-avicola-garces` (o pasar la web a `main`).
- O desde la PC, en la carpeta del sitio: `npx vercel` y luego `npx vercel --prod`.
- Dominio: Settings → Domains → `avicolag.boacgro.com`; en Cloudflare, CNAME `avicolag` → `cname.vercel-dns.com`, nube gris (DNS only).

## Opción D · Servidor Apache
Subir los archivos públicos a la carpeta pública; `.htaccess` ya trae compresión, caché y bloqueo de archivos internos.

## Si cambia el dominio
Actualizar `https://avicolag.boacgro.com` en `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt` y `sitemap.xml`.
