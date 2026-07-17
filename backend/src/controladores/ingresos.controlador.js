const bd = require('../bd');
const { ErrorAplicacion } = require('../utilidades/errores');

function listarIngresos(req, res) {
  const { desde, hasta, categoriaId } = req.query;
  const condiciones = ['i.family_group_id = ?'];
  const parametros = [req.usuario.family_group_id];

  if (desde) {
    condiciones.push('i.fecha >= ?');
    parametros.push(desde);
  }
  if (hasta) {
    condiciones.push('i.fecha <= ?');
    parametros.push(hasta);
  }
  if (categoriaId) {
    condiciones.push('i.categoria_id = ?');
    parametros.push(Number(categoriaId));
  }

  const ingresos = bd
    .prepare(
      `SELECT i.*, c.nombre AS categoria_nombre, u.nombre AS usuario_nombre
       FROM ingresos i
       JOIN categorias c ON c.id = i.categoria_id
       JOIN usuarios u ON u.id = i.usuario_id
       WHERE ${condiciones.join(' AND ')}
       ORDER BY i.fecha DESC, i.id DESC`
    )
    .all(...parametros);

  res.json({ ingresos });
}

function validarCategoriaDeIngreso(req, categoriaId) {
  const categoria = bd
    .prepare('SELECT * FROM categorias WHERE id = ? AND family_group_id = ? AND tipo = ?')
    .get(categoriaId, req.usuario.family_group_id, 'ingreso');
  if (!categoria) {
    throw new ErrorAplicacion(400, 'La categoria indicada no es valida.');
  }
}

function crearIngreso(req, res, next) {
  try {
    const { categoriaId, monto, fecha, nota } = req.body;

    if (!categoriaId || !monto || !fecha) {
      throw new ErrorAplicacion(400, 'Completa categoria, monto y fecha del ingreso.');
    }
    if (Number(monto) <= 0) {
      throw new ErrorAplicacion(400, 'El monto debe ser mayor que cero.');
    }
    validarCategoriaDeIngreso(req, Number(categoriaId));

    const resultado = bd
      .prepare(
        `INSERT INTO ingresos (family_group_id, usuario_id, categoria_id, monto, fecha, nota)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(req.usuario.family_group_id, req.usuario.id, Number(categoriaId), Number(monto), fecha, nota || null);

    const ingreso = bd.prepare('SELECT * FROM ingresos WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json({ ingreso });
  } catch (error) {
    next(error);
  }
}

function obtenerIngresoPropioOAdmin(req) {
  const id = Number(req.params.id);
  const ingreso = bd
    .prepare('SELECT * FROM ingresos WHERE id = ? AND family_group_id = ?')
    .get(id, req.usuario.family_group_id);

  if (!ingreso) {
    throw new ErrorAplicacion(404, 'No se encontro ese ingreso.');
  }
  if (req.usuario.rol !== 'admin' && ingreso.usuario_id !== req.usuario.id) {
    throw new ErrorAplicacion(403, 'Solo puedes editar o borrar los ingresos que tu registraste.');
  }
  return ingreso;
}

function actualizarIngreso(req, res, next) {
  try {
    const ingreso = obtenerIngresoPropioOAdmin(req);
    const { categoriaId, monto, fecha, nota } = req.body;

    if (categoriaId) {
      validarCategoriaDeIngreso(req, Number(categoriaId));
    }
    if (monto !== undefined && Number(monto) <= 0) {
      throw new ErrorAplicacion(400, 'El monto debe ser mayor que cero.');
    }

    bd.prepare(
      `UPDATE ingresos SET categoria_id = ?, monto = ?, fecha = ?, nota = ?,
       actualizado_en = datetime('now') WHERE id = ?`
    ).run(
      categoriaId ? Number(categoriaId) : ingreso.categoria_id,
      monto !== undefined ? Number(monto) : ingreso.monto,
      fecha || ingreso.fecha,
      nota !== undefined ? nota : ingreso.nota,
      ingreso.id
    );

    const actualizado = bd.prepare('SELECT * FROM ingresos WHERE id = ?').get(ingreso.id);
    res.json({ ingreso: actualizado });
  } catch (error) {
    next(error);
  }
}

function eliminarIngreso(req, res, next) {
  try {
    const ingreso = obtenerIngresoPropioOAdmin(req);
    bd.prepare('DELETE FROM ingresos WHERE id = ?').run(ingreso.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listarIngresos, crearIngreso, actualizarIngreso, eliminarIngreso };
