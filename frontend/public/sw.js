const CACHE_ACTUAL = 'finanzas-hogar-v1';
const ARCHIVOS_BASICOS = ['/', '/manifest.json', '/icono-192.png', '/icono-512.png'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_ACTUAL).then((cache) => cache.addAll(ARCHIVOS_BASICOS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((clave) => clave !== CACHE_ACTUAL).map((clave) => caches.delete(clave))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET' || evento.request.url.includes('/api/')) {
    return;
  }
  evento.respondWith(
    caches.match(evento.request).then((respuestaCache) => {
      const buscarEnRed = fetch(evento.request)
        .then((respuestaRed) => {
          const copia = respuestaRed.clone();
          caches.open(CACHE_ACTUAL).then((cache) => cache.put(evento.request, copia));
          return respuestaRed;
        })
        .catch(() => respuestaCache);
      return respuestaCache || buscarEnRed;
    })
  );
});

self.addEventListener('push', (evento) => {
  let datos = { titulo: 'Finanzas del Hogar', cuerpo: 'Tienes una notificacion nueva.' };
  if (evento.data) {
    try {
      datos = evento.data.json();
    } catch {
      datos.cuerpo = evento.data.text();
    }
  }

  evento.waitUntil(
    self.registration.showNotification(datos.titulo || 'Finanzas del Hogar', {
      body: datos.cuerpo,
      icon: '/icono-192.png',
      badge: '/icono-192.png',
    })
  );
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  evento.waitUntil(clients.openWindow('/'));
});
