"""Genera la web en un único HTML con CSS, JS, fuentes, imágenes y video incrustados.
Uso (desde la raíz del proyecto): python3 tools/construir-un-archivo.py salida.html
"""
import re, base64, sys, os
out = sys.argv[1] if len(sys.argv) > 1 else 'avicola-garces.html'
mime = {'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.mp4':'video/mp4'}
def uri(p):
    p = os.path.normpath(p)
    return 'data:%s;base64,%s' % (mime[os.path.splitext(p)[1]], base64.b64encode(open(p,'rb').read()).decode())
h = open('index.html', encoding='utf-8').read()
css = open('assets/css/styles.v1.css', encoding='utf-8').read()
css = re.sub(r'url\("\.\./fonts/([^"]+)"\)', lambda m: 'url("%s")' % uri('assets/fonts/'+m.group(1)), css)
js = open('assets/js/main.v1.js', encoding='utf-8').read()
h = re.sub(r'\s*<link rel="preload"[^>]*>', '', h)
h = h.replace('<link rel="stylesheet" href="assets/css/styles.v1.css">', '<style>\n'+css+'\n</style>')
h = h.replace('<script src="assets/js/main.v1.js" defer></script>', '')
h = h.replace('</body>', '<script>\n'+js+'\n</script>\n</body>')
def fix(m):
    t = m.group(0)
    ss = re.search(r'\ssrcset="([^"]+)"', t)
    if ss:
        best = [c.strip().split()[0] for c in ss.group(1).split(',') if c.strip()][-1]
        t = t.replace(ss.group(0), ' srcset="%s"' % uri(best)) if t.startswith('<source') else t.replace(ss.group(0), '')
        if t.startswith('<img'): t = re.sub(r'\ssrc="[^"]+"', ' src="%s"' % uri(best), t)
        t = re.sub(r'\ssizes="[^"]+"', '', t)
    else:
        s = re.search(r'\ssrc="(assets/[^"]+)"', t)
        if s and os.path.exists(s.group(1)): t = t.replace(s.group(0), ' src="%s"' % uri(s.group(1)))
    return t
h = re.sub(r'<(?:img|source)\b[^>]*>', fix, h)
for rel in ['assets/img/favicon-32.png', 'assets/img/apple-touch-icon.png']:
    h = h.replace('href="%s"' % rel, 'href="%s"' % uri(rel))
h = re.sub(r'data-video-mp4="(assets/[^"]+)"', lambda m: 'data-video-mp4="%s"' % uri(m.group(1)), h)
open(out, 'w', encoding='utf-8').write(h)
print('Listo:', out, round(os.path.getsize(out)/1e6, 2), 'MB')
