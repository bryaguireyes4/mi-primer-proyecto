const bd = require('../bd');
const { ErrorAplicacion } = require('../utilidades/errores');

function conCategorias(etiqueta) {
  const categorias = bd
    .prepare('SELECT categoria_id FROM etiquetas_categorias WHERE etiqueta_id = ?')
    .all(etiqueta.id)
    .map((fila) => fila.categoria_id);
  return { ...etiqueta, categorias_ids: categorias };
}

function listarEtiquetas(req, res) {
  const etiquetas = bd
    .prepare('SELECT * FROM etiquetas WHERE family_group_id = ? ORDER BY prioridad ASC')
    .all(req.usuario.family_group_id)
    .map(conCategorias);
  res.json({ etiquetas });
}

function guardarCategoriasAplicables(etiquetaId, categoriasIds) {
  bd.prepare('DELETE FROM etiquetas_categorias WHERE etiqueta_id = ?').run(etiquetaId);
  if (!Array.isArray(categoriasIds) || categoriasIds.length === 0) return;

  const insertar = bd.prepare(
    'INSERT INTO etiquetas_categorias (etiqueta_id, categoria_id) VALUES (?, ?)'
  );
  categoriasIds.forEach((categoriaId) => insertar.run(etiquetaId, categoriaId));
}

function crearEtiqueta(req, res, next) {
  try {
    const {
      nombre,
      prioridad,
      montoMin,
      montoMax,
      frecuenciaRepeticiones,
      frecuenciaDias,
      recurrenciaMeses,
      recurrenciaToleranciaPct,
      categoriasIds,
    } = req.body;

    if (!nombre) {
      throw new ErrorAplicacion(400, 'La etiqueta necesita un nombre.');
    }

    const existente = bd
      .prepare('SELECT id FROM etiquetas WHERE family_group_id = ? AND nombre = ?')
      .get(req.usuario.family_group_id, nombre.trim());
    if (existente) {
      throw new ErrorAplicacion(409, 'Ya existe una etiqueta con ese nombre.');
    }

    const resultado = bd
      .prepare(
        `INSERT INTO etiquetas
           (family_group_id, nombre, prioridad, monto_min, monto_max,
            frecuencia_repeticiones, frecuencia_dias, recurrencia_meses, recurrencia_tolerancia_pct)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.usuario.family_group_id,
        nombre.trim(),
        prioridad ?? 100,
        montoMin ?? null,
        montoMax ?? null,
        frecuenciaRepeticiones ?? null,
        frecuenciaDias ?? null,
        recurrenciaMeses ?? null,
        recurrenciaToleranciaPct ?? null
      );

    guardarCategoriasAplicables(resultado.lastInsertRowid, categoriasIds);

    const etiqueta = bd.prepare('SELECT * FROM etiquetas WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json({ etiqueta: conCategorias(etiqueta) });
  } catch (error) {
    next(error);
  }
}

function actualizarEtiqueta(req, res, next) {
  try {
    const id = Number(req.params.id);
    const etiqueta = bd
      .prepare('SELECT * FROM etiquetas WHERE id = ? AND family_group_id = ?')
      .get(id, req.usuario.family_group_id);
    if (!etiqueta) {
      throw new ErrorAplicacion(404, 'No se encontro esa etiqueta.');
    }

    const {
      nombre,
      prioridad,
      montoMin,
      montoMax,
      frecuenciaRepeticiones,
      frecuenciaDias,
      recurrenciaMeses,
      recurrenciaToleranciaPct,
      activa,
      categoriasIds,
    } = req.body;

    bd.prepare(
      `UPDATE etiquetas SET
         nombre = ?, prioridad = ?, monto_min = ?, monto_max = ?,
         frecuencia_repeticiones = ?, frecuencia_dias = ?,
         recurrencia_meses = ?, recurrencia_tolerancia_pct = ?,
         activa = ?, actualizado_en = datetime('now')
       WHERE id = ?`
    ).run(
      nombre ? nombre.trim() : etiqueta.nombre,
      prioridad ?? etiqueta.prioridad,
      montoMin !== undefined ? montoMin : etiqueta.monto_min,
      montoMax !== undefined ? montoMax : etiqueta.monto_max,
      frecuenciaRepeticiones !== undefined ? frecuenciaRepeticiones : etiqueta.frecuencia_repeticiones,
      frecuenciaDias !== undefined ? frecuenciaDias : etiqueta.frecuencia_dias,
      recurrenciaMeses !== undefined ? recurrenciaMeses : etiqueta.recurrencia_meses,
      recurrenciaToleranciaPct !== undefined ? recurrenciaToleranciaPct : etiqueta.recurrencia_tolerancia_pct,
      typeof activa === 'boolean' ? (activa ? 1 : 0) : etiqueta.activa,
      id
    );

    if (categoriasIds !== undefined) {
      guardarCategoriasAplicables(id, categoriasIds);
    }

    const actualizada = bd.prepare('SELECT * FROM etiquetas WHERE id = ?').get(id);
    res.json({ etiqueta: conCategorias(actualizada) });
  } catch (error) {
    next(error);
  }
}

function eliminarEtiqueta(req, res, next) {
  try {
    const id = Number(req.params.id);
    const etiqueta = bd
      .prepare('SELECT * FROM etiquetas WHERE id = ? AND family_group_id = ?')
      .get(id, req.usuario.family_group_id);
    if (!etiqueta) {
      throw new ErrorAplicacion(404, 'No se encontro esa etiqueta.');
    }
    bd.prepare('UPDATE gastos SET etiqueta_id = NULL WHERE etiqueta_id = ?').run(id);
    bd.prepare('DELETE FROM etiquetas WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listarEtiquetas, crearEtiqueta, actualizarEtiqueta, eliminarEtiqueta };
