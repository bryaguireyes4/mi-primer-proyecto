const bd = require('../bd');
const entorno = require('../configuracion/entorno');
const { ErrorAplicacion } = require('../utilidades/errores');

function obtenerClavePublica(req, res) {
  res.json({ clavePublica: entorno.vapid.clavePublica });
}

function suscribir(req, res, next) {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new ErrorAplicacion(400, 'La suscripcion push no tiene el formato esperado.');
    }

    bd.prepare(
      `INSERT INTO suscripciones_push (usuario_id, endpoint, p256dh, auth)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET usuario_id = excluded.usuario_id, p256dh = excluded.p256dh, auth = excluded.auth`
    ).run(req.usuario.id, endpoint, keys.p256dh, keys.auth);

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

function desuscribir(req, res, next) {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      throw new ErrorAplicacion(400, 'Falta el endpoint de la suscripcion a eliminar.');
    }
    bd.prepare('DELETE FROM suscripciones_push WHERE endpoint = ? AND usuario_id = ?').run(
      endpoint,
      req.usuario.id
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { obtenerClavePublica, suscribir, desuscribir };
