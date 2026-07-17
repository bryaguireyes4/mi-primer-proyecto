const bd = require('../bd');
const { ErrorAplicacion } = require('../utilidades/errores');
const { sugerirEtiqueta } = require('../utilidades/motorEtiquetas');
const { enviarNotificacionAFamilia } = require('../utilidades/notificacionesPush');

function revisarPresupuesto(familyGroupId, categoriaId, fecha) {
  const mes = fecha.slice(0, 7);
  const presupuesto = bd
    .prepare('SELECT * FROM presupuestos WHERE family_group_id = ? AND categoria_id = ? AND mes = ?')
    .get(familyGroupId, categoriaId, mes);
  if (!presupuesto) return;

  const gastado = bd
    .prepare("SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE family_group_id = ? AND categoria_id = ? AND fecha LIKE ?")
    .get(familyGroupId, categoriaId, `${mes}%`).total;

  const porcentaje = (gastado / presupuesto.monto_limite) * 100;
  if (porcentaje >= presupuesto.porcentaje_alerta) {
    const categoria = bd.prepare('SELECT nombre FROM categorias WHERE id = ?').get(categoriaId);
    enviarNotificacionAFamilia(familyGroupId, {
      titulo: 'Presupuesto casi agotado',
      cuerpo: `Ya llevas ${Math.round(porcentaje)}% del presupuesto de ${categoria.nombre} este mes.`,
    }).catch(() => {});
  }
}

function listarGastos(req, res) {
  const { desde, hasta, categoriaId } = req.query;
  const condiciones = ['g.family_group_id = ?'];
  const parametros = [req.usuario.family_group_id];

  if (desde) {
    condiciones.push('g.fecha >= ?');
    parametros.push(desde);
  }
  if (hasta) {
    condiciones.push('g.fecha <= ?');
    parametros.push(hasta);
  }
  if (categoriaId) {
    condiciones.push('g.categoria_id = ?');
    parametros.push(Number(categoriaId));
  }

  const gastos = bd
    .prepare(
      `SELECT g.*, c.nombre AS categoria_nombre, u.nombre AS usuario_nombre, e.nombre AS etiqueta_nombre
       FROM gastos g
       JOIN categorias c ON c.id = g.categoria_id
       JOIN usuarios u ON u.id = g.usuario_id
       LEFT JOIN etiquetas e ON e.id = g.etiqueta_id
       WHERE ${condiciones.join(' AND ')}
       ORDER BY g.fecha DESC, g.id DESC`
    )
    .all(...parametros);

  res.json({ gastos });
}

function validarCategoriaDeGasto(req, categoriaId) {
  const categoria = bd
    .prepare('SELECT * FROM categorias WHERE id = ? AND family_group_id = ? AND tipo = ?')
    .get(categoriaId, req.usuario.family_group_id, 'gasto');
  if (!categoria) {
    throw new ErrorAplicacion(400, 'La categoria indicada no es valida.');
  }
  return categoria;
}

function sugerirEtiquetaGasto(req, res, next) {
  try {
    const { categoriaId, monto, fecha } = req.body;
    if (!categoriaId || !monto || !fecha) {
      throw new ErrorAplicacion(400, 'Indica categoria, monto y fecha para sugerir una etiqueta.');
    }
    validarCategoriaDeGasto(req, Number(categoriaId));

    const etiqueta = sugerirEtiqueta({
      familyGroupId: req.usuario.family_group_id,
      usuarioId: req.usuario.id,
      categoriaId: Number(categoriaId),
      monto: Number(monto),
      fecha,
    });

    res.json({ etiqueta });
  } catch (error) {
    next(error);
  }
}

function crearGasto(req, res, next) {
  try {
    const { categoriaId, monto, fecha, nota, etiquetaId } = req.body;

    if (!categoriaId || !monto || !fecha) {
      throw new ErrorAplicacion(400, 'Completa categoria, monto y fecha del gasto.');
    }
    if (Number(monto) <= 0) {
      throw new ErrorAplicacion(400, 'El monto debe ser mayor que cero.');
    }
    validarCategoriaDeGasto(req, Number(categoriaId));

    const resultado = bd
      .prepare(
        `INSERT INTO gastos (family_group_id, usuario_id, categoria_id, etiqueta_id, monto, fecha, nota)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.usuario.family_group_id,
        req.usuario.id,
        Number(categoriaId),
        etiquetaId || null,
        Number(monto),
        fecha,
        nota || null
      );

    const gasto = bd.prepare('SELECT * FROM gastos WHERE id = ?').get(resultado.lastInsertRowid);
    revisarPresupuesto(req.usuario.family_group_id, Number(categoriaId), fecha);
    res.status(201).json({ gasto });
  } catch (error) {
    next(error);
  }
}

function obtenerGastoPropioOAdmin(req) {
  const id = Number(req.params.id);
  const gasto = bd
    .prepare('SELECT * FROM gastos WHERE id = ? AND family_group_id = ?')
    .get(id, req.usuario.family_group_id);

  if (!gasto) {
    throw new ErrorAplicacion(404, 'No se encontro ese gasto.');
  }
  if (req.usuario.rol !== 'admin' && gasto.usuario_id !== req.usuario.id) {
    throw new ErrorAplicacion(403, 'Solo puedes editar o borrar los gastos que tu registraste.');
  }
  return gasto;
}

function actualizarGasto(req, res, next) {
  try {
    const gasto = obtenerGastoPropioOAdmin(req);
    const { categoriaId, monto, fecha, nota, etiquetaId } = req.body;

    if (categoriaId) {
      validarCategoriaDeGasto(req, Number(categoriaId));
    }
    if (monto !== undefined && Number(monto) <= 0) {
      throw new ErrorAplicacion(400, 'El monto debe ser mayor que cero.');
    }

    bd.prepare(
      `UPDATE gastos SET categoria_id = ?, etiqueta_id = ?, monto = ?, fecha = ?, nota = ?,
       actualizado_en = datetime('now') WHERE id = ?`
    ).run(
      categoriaId ? Number(categoriaId) : gasto.categoria_id,
      etiquetaId !== undefined ? etiquetaId || null : gasto.etiqueta_id,
      monto !== undefined ? Number(monto) : gasto.monto,
      fecha || gasto.fecha,
      nota !== undefined ? nota : gasto.nota,
      gasto.id
    );

    const actualizado = bd.prepare('SELECT * FROM gastos WHERE id = ?').get(gasto.id);
    res.json({ gasto: actualizado });
  } catch (error) {
    next(error);
  }
}

function eliminarGasto(req, res, next) {
  try {
    const gasto = obtenerGastoPropioOAdmin(req);
    bd.prepare('DELETE FROM gastos WHERE id = ?').run(gasto.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listarGastos, sugerirEtiquetaGasto, crearGasto, actualizarGasto, eliminarGasto };
