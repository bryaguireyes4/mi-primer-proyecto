const webpush = require('web-push');
const bd = require('../bd');
const entorno = require('../configuracion/entorno');

let configurado = false;

function asegurarConfiguracion() {
  if (configurado || !entorno.vapid.clavePublica || !entorno.vapid.clavePrivada) return;
  webpush.setVapidDetails(entorno.vapid.asunto, entorno.vapid.clavePublica, entorno.vapid.clavePrivada);
  configurado = true;
}

async function enviarNotificacionAFamilia(familyGroupId, payload) {
  asegurarConfiguracion();
  if (!configurado) return;

  const suscripciones = bd
    .prepare(
      `SELECT s.* FROM suscripciones_push s
       JOIN usuarios u ON u.id = s.usuario_id
       WHERE u.family_group_id = ?`
    )
    .all(familyGroupId);

  await Promise.all(
    suscripciones.map(async (suscripcion) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: suscripcion.endpoint,
            keys: { p256dh: suscripcion.p256dh, auth: suscripcion.auth },
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          bd.prepare('DELETE FROM suscripciones_push WHERE id = ?').run(suscripcion.id);
        }
      }
    })
  );
}

module.exports = { enviarNotificacionAFamilia };
