const bd = require('../bd');
const { ErrorAplicacion } = require('../utilidades/errores');
const { calcularRecomendacion } = require('../utilidades/motorRecomendacionDeudas');

function obtenerRecomendacion(req, res) {
  const mes = req.query.mes || new Date().toISOString().slice(0, 7);
  const recomendacion = calcularRecomendacion(req.usuario.family_group_id, mes);
  res.json({ mes, ...recomendacion });
}

function calcularFechaFinEstimada(fechaPagoDia, plazoMeses) {
  if (!plazoMeses) return null;
  const fecha = new Date();
  fecha.setDate(1);
  fecha.setMonth(fecha.getMonth() + plazoMeses);
  fecha.setDate(Math.min(fechaPagoDia, 28));
  return fecha.toISOString().slice(0, 10);
}

function listarDeudas(req, res) {
  const deudas = bd
    .prepare(
      `SELECT d.*, u.nombre AS usuario_nombre
       FROM deudas d
       JOIN usuarios u ON u.id = d.usuario_id
       WHERE d.family_group_id = ?
       ORDER BY d.activa DESC, d.tasa_interes DESC`
    )
    .all(req.usuario.family_group_id);
  res.json({ deudas });
}

function crearDeuda(req, res, next) {
  try {
    const { acreedor, montoTotal, saldoRestante, tasaInteres, pagoMinimoMensual, fechaPago, plazoMeses } =
      req.body;

    if (!acreedor || !montoTotal || !pagoMinimoMensual || !fechaPago) {
      throw new ErrorAplicacion(400, 'Completa acreedor, monto total, pago minimo y fecha de pago.');
    }
    if (fechaPago < 1 || fechaPago > 31) {
      throw new ErrorAplicacion(400, 'La fecha de pago debe ser un dia del mes entre 1 y 31.');
    }

    const fechaFinEstimada = calcularFechaFinEstimada(Number(fechaPago), plazoMeses ? Number(plazoMeses) : null);

    const resultado = bd
      .prepare(
        `INSERT INTO deudas
           (family_group_id, usuario_id, acreedor, monto_total, saldo_restante, tasa_interes,
            pago_minimo_mensual, fecha_pago, plazo_meses, fecha_fin_estimada, activa)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
      )
      .run(
        req.usuario.family_group_id,
        req.usuario.id,
        acreedor.trim(),
        Number(montoTotal),
        saldoRestante != null ? Number(saldoRestante) : Number(montoTotal),
        Number(tasaInteres) || 0,
        Number(pagoMinimoMensual),
        Number(fechaPago),
        plazoMeses ? Number(plazoMeses) : null,
        fechaFinEstimada
      );

    const deuda = bd.prepare('SELECT * FROM deudas WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json({ deuda });
  } catch (error) {
    next(error);
  }
}

function obtenerDeudaPropiaOAdmin(req) {
  const id = Number(req.params.id);
  const deuda = bd
    .prepare('SELECT * FROM deudas WHERE id = ? AND family_group_id = ?')
    .get(id, req.usuario.family_group_id);

  if (!deuda) {
    throw new ErrorAplicacion(404, 'No se encontro esa deuda.');
  }
  if (req.usuario.rol !== 'admin' && deuda.usuario_id !== req.usuario.id) {
    throw new ErrorAplicacion(403, 'Solo puedes editar o borrar las deudas que tu registraste.');
  }
  return deuda;
}

function reasignarCuotaLiberadaAMeta(req, deuda) {
  const meta = bd
    .prepare('SELECT * FROM metas_ahorro WHERE family_group_id = ? AND activa = 1 ORDER BY id ASC LIMIT 1')
    .get(req.usuario.family_group_id);
  if (!meta) return;

  bd.prepare(
    `UPDATE metas_ahorro SET aporte_mensual = aporte_mensual + ?, actualizado_en = datetime('now')
     WHERE id = ?`
  ).run(deuda.pago_minimo_mensual, meta.id);
}

function actualizarDeuda(req, res, next) {
  try {
    const deuda = obtenerDeudaPropiaOAdmin(req);
    const { acreedor, montoTotal, saldoRestante, tasaInteres, pagoMinimoMensual, fechaPago, plazoMeses } =
      req.body;

    const nuevoSaldo = saldoRestante != null ? Number(saldoRestante) : deuda.saldo_restante;
    const seSaldo = deuda.activa && nuevoSaldo <= 0;

    bd.prepare(
      `UPDATE deudas SET acreedor = ?, monto_total = ?, saldo_restante = ?, tasa_interes = ?,
       pago_minimo_mensual = ?, fecha_pago = ?, plazo_meses = ?, activa = ?, actualizado_en = datetime('now')
       WHERE id = ?`
    ).run(
      acreedor ? acreedor.trim() : deuda.acreedor,
      montoTotal != null ? Number(montoTotal) : deuda.monto_total,
      Math.max(nuevoSaldo, 0),
      tasaInteres != null ? Number(tasaInteres) : deuda.tasa_interes,
      pagoMinimoMensual != null ? Number(pagoMinimoMensual) : deuda.pago_minimo_mensual,
      fechaPago != null ? Number(fechaPago) : deuda.fecha_pago,
      plazoMeses != null ? Number(plazoMeses) : deuda.plazo_meses,
      seSaldo ? 0 : deuda.activa,
      deuda.id
    );

    if (seSaldo) {
      reasignarCuotaLiberadaAMeta(req, deuda);
    }

    const actualizada = bd.prepare('SELECT * FROM deudas WHERE id = ?').get(deuda.id);
    res.json({ deuda: actualizada, saldada: seSaldo });
  } catch (error) {
    next(error);
  }
}

function eliminarDeuda(req, res, next) {
  try {
    const deuda = obtenerDeudaPropiaOAdmin(req);
    bd.prepare('DELETE FROM deudas WHERE id = ?').run(deuda.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listarDeudas, crearDeuda, actualizarDeuda, eliminarDeuda, obtenerRecomendacion };
