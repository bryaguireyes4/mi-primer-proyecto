const bd = require('../bd');
const { ErrorAplicacion } = require('../utilidades/errores');

function listarMetas(req, res) {
  const metas = bd
    .prepare(
      `SELECT m.*, u.nombre AS usuario_nombre FROM metas_ahorro m
       JOIN usuarios u ON u.id = m.usuario_id
       WHERE m.family_group_id = ? ORDER BY m.activa DESC, m.id DESC`
    )
    .all(req.usuario.family_group_id);
  res.json({ metas });
}

function crearMeta(req, res, next) {
  try {
    const { nombre, montoObjetivo, montoAcumulado, aporteMensual } = req.body;
    if (!nombre || !montoObjetivo) {
      throw new ErrorAplicacion(400, 'Indica un nombre y un monto objetivo.');
    }

    const resultado = bd
      .prepare(
        `INSERT INTO metas_ahorro (family_group_id, usuario_id, nombre, monto_objetivo, monto_acumulado, aporte_mensual, activa)
         VALUES (?, ?, ?, ?, ?, ?, 1)`
      )
      .run(
        req.usuario.family_group_id,
        req.usuario.id,
        nombre.trim(),
        Number(montoObjetivo),
        Number(montoAcumulado) || 0,
        Number(aporteMensual) || 0
      );

    const meta = bd.prepare('SELECT * FROM metas_ahorro WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json({ meta });
  } catch (error) {
    next(error);
  }
}

function obtenerMetaPropiaOAdmin(req) {
  const id = Number(req.params.id);
  const meta = bd
    .prepare('SELECT * FROM metas_ahorro WHERE id = ? AND family_group_id = ?')
    .get(id, req.usuario.family_group_id);
  if (!meta) {
    throw new ErrorAplicacion(404, 'No se encontro esa meta.');
  }
  if (req.usuario.rol !== 'admin' && meta.usuario_id !== req.usuario.id) {
    throw new ErrorAplicacion(403, 'Solo puedes editar o borrar las metas que tu registraste.');
  }
  return meta;
}

function actualizarMeta(req, res, next) {
  try {
    const meta = obtenerMetaPropiaOAdmin(req);
    const { nombre, montoObjetivo, montoAcumulado, aporteMensual, activa } = req.body;

    bd.prepare(
      `UPDATE metas_ahorro SET nombre = ?, monto_objetivo = ?, monto_acumulado = ?, aporte_mensual = ?,
       activa = ?, actualizado_en = datetime('now') WHERE id = ?`
    ).run(
      nombre ? nombre.trim() : meta.nombre,
      montoObjetivo != null ? Number(montoObjetivo) : meta.monto_objetivo,
      montoAcumulado != null ? Number(montoAcumulado) : meta.monto_acumulado,
      aporteMensual != null ? Number(aporteMensual) : meta.aporte_mensual,
      typeof activa === 'boolean' ? (activa ? 1 : 0) : meta.activa,
      meta.id
    );

    const actualizada = bd.prepare('SELECT * FROM metas_ahorro WHERE id = ?').get(meta.id);
    res.json({ meta: actualizada });
  } catch (error) {
    next(error);
  }
}

function eliminarMeta(req, res, next) {
  try {
    const meta = obtenerMetaPropiaOAdmin(req);
    bd.prepare('DELETE FROM metas_ahorro WHERE id = ?').run(meta.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listarMetas, crearMeta, actualizarMeta, eliminarMeta };
