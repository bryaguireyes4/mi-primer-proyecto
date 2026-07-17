import cliente from '../api/cliente';

function convertirClaveVapid(claveBase64) {
  const relleno = '='.repeat((4 - (claveBase64.length % 4)) % 4);
  const base64 = (claveBase64 + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const bruto = window.atob(base64);
  return Uint8Array.from([...bruto].map((caracter) => caracter.charCodeAt(0)));
}

export async function activarNotificaciones() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Este navegador no soporta notificaciones push.');
  }

  const registro = await navigator.serviceWorker.register('/sw.js');
  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') {
    throw new Error('No se otorgo permiso para enviar notificaciones.');
  }

  const { data } = await cliente.get('/notificaciones/clave-publica');
  if (!data.clavePublica) {
    throw new Error('El servidor aun no tiene configuradas las claves VAPID.');
  }

  const suscripcion = await registro.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertirClaveVapid(data.clavePublica),
  });

  await cliente.post('/notificaciones/suscribir', suscripcion.toJSON());
  return suscripcion;
}
