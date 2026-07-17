const bd = require('../bd');
const { ErrorAplicacion } = require('../utilidades/errores');

function listarPresupuestos(req, res) {
  const { mes } = req.query;
  const condiciones = ['p.family_group_id = ?'];
  const parametros = [req.usuario.family_group_id];

  if (mes) {
    condiciones.push('p.mes = ?');
    parametros.push(mes);
  }

  const presupuestos = bd
    .prepare(
      `SELECT p.*, c.nombre AS categoria_nombre,
         COALESCE((SELECT SUM(g.monto) FROM gastos g WHERE g.categoria_id = p.categoria_id AND g.fecha LIKE p.mes || '%'), 0) AS gastado
       FROM presupuestos p
       JOIN categorias c ON c.id = p.categoria_id
       WHERE ${condiciones.join(' AND ')}
       ORDER BY p.mes DESC, c.nombre ASC`
    )
    .all(...parametros);

  res.json({ presupuestos });
}

function crearPresupuesto(req, res, next) {
  try {
    const { categoriaId, mes, montoLimite, porcentajeAlerta } = req.body;

    if (!categoriaId || !mes || !montoLimite) {
      throw new ErrorAplicacion(400, 'Completa categoria, mes y monto limite.');
    }
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      throw new ErrorAplicacion(400, 'El mes debe tener el formato AAAA-MM.');
    }

    const categoria = bd
      .prepare('SELECT * FROM categorias WHERE id = ? AND family_group_id = ? AND tipo = ?')
      .get(Number(categoriaId), req.usuario.family_group_id, 'gasto');
    if (!categoria) {
      throw new ErrorAplicacion(400, 'La categoria indicada no es valida.');
    }

    const existente = bd
      .prepare('SELECT id FROM presupuestos WHERE family_group_id = ? AND categoria_id = ? AND mes = ?')
      .get(req.usuario.family_group_id, Number(categoriaId), mes);
    if (existente) {
      throw new ErrorAplicacion(409, 'Ya existe un presupuesto para esa categoria en ese mes.');
    }

    const resultado = bd
      .prepare(
        `INSERT INTO presupuestos (family_group_id, categoria_id, mes, monto_limite, porcentaje_alerta)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        req.usuario.family_group_id,
        Number(categoriaId),
        mes,
        Number(montoLimite),
        porcentajeAlerta != null ? Number(porcentajeAlerta) : 80
      );

    const presupuesto = bd.prepare('SELECT * FROM presupuestos WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json({ presupuesto });
  } catch (error) {
    next(error);
  }
}

function actualizarPresupuesto(req, res, next) {
  try {
    const id = Number(req.params.id);
    const presupuesto = bd
      .prepare('SELECT * FROM presupuestos WHERE id = ? AND family_group_id = ?')
      .get(id, req.usuario.family_group_id);
    if (!presupuesto) {
      throw new ErrorAplicacion(404, 'No se encontro ese presupuesto.');
    }

    const { montoLimite, porcentajeAlerta } = req.body;
    bd.prepare(
      `UPDATE presupuestos SET monto_limite = ?, porcentaje_alerta = ?, actualizado_en = datetime('now')
       WHERE id = ?`
    ).run(
      montoLimite != null ? Number(montoLimite) : presupuesto.monto_limite,
      porcentajeAlerta != null ? Number(porcentajeAlerta) : presupuesto.porcentaje_alerta,
      id
    );

    const actualizado = bd.prepare('SELECT * FROM presupuestos WHERE id = ?').get(id);
    res.json({ presupuesto: actualizado });
  } catch (error) {
    next(error);
  }
}

function eliminarPresupuesto(req, res, next) {
  try {
    const id = Number(req.params.id);
    const presupuesto = bd
      .prepare('SELECT * FROM presupuestos WHERE id = ? AND family_group_id = ?')
      .get(id, req.usuario.family_group_id);
    if (!presupuesto) {
      throw new ErrorAplicacion(404, 'No se encontro ese presupuesto.');
    }
    bd.prepare('DELETE FROM presupuestos WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listarPresupuestos, crearPresupuesto, actualizarPresupuesto, eliminarPresupuesto };
