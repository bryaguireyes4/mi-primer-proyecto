const bd = require('../bd');
const { ErrorAplicacion } = require('../utilidades/errores');

const TIPOS_VALIDOS = ['gasto', 'ingreso'];

function listarCategorias(req, res) {
  const { tipo } = req.query;
  let categorias;
  if (tipo && TIPOS_VALIDOS.includes(tipo)) {
    categorias = bd
      .prepare('SELECT * FROM categorias WHERE family_group_id = ? AND tipo = ? ORDER BY nombre ASC')
      .all(req.usuario.family_group_id, tipo);
  } else {
    categorias = bd
      .prepare('SELECT * FROM categorias WHERE family_group_id = ? ORDER BY tipo ASC, nombre ASC')
      .all(req.usuario.family_group_id);
  }
  res.json({ categorias });
}

function crearCategoria(req, res, next) {
  try {
    const { nombre, tipo } = req.body;
    if (!nombre || !TIPOS_VALIDOS.includes(tipo)) {
      throw new ErrorAplicacion(400, 'Indica un nombre y un tipo valido ("gasto" o "ingreso").');
    }

    const existente = bd
      .prepare('SELECT id FROM categorias WHERE family_group_id = ? AND nombre = ? AND tipo = ?')
      .get(req.usuario.family_group_id, nombre.trim(), tipo);
    if (existente) {
      throw new ErrorAplicacion(409, 'Ya existe una categoria con ese nombre.');
    }

    const resultado = bd
      .prepare('INSERT INTO categorias (family_group_id, nombre, tipo) VALUES (?, ?, ?)')
      .run(req.usuario.family_group_id, nombre.trim(), tipo);

    const categoria = bd.prepare('SELECT * FROM categorias WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json({ categoria });
  } catch (error) {
    next(error);
  }
}

function eliminarCategoria(req, res, next) {
  try {
    const id = Number(req.params.id);
    const categoria = bd
      .prepare('SELECT * FROM categorias WHERE id = ? AND family_group_id = ?')
      .get(id, req.usuario.family_group_id);
    if (!categoria) {
      throw new ErrorAplicacion(404, 'No se encontro esa categoria.');
    }

    const enUso = bd
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM gastos WHERE categoria_id = ?) +
           (SELECT COUNT(*) FROM ingresos WHERE categoria_id = ?) AS total`
      )
      .get(id, id).total;
    if (enUso > 0) {
      throw new ErrorAplicacion(400, 'No puedes eliminar una categoria que ya tiene movimientos registrados.');
    }

    bd.prepare('DELETE FROM categorias WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listarCategorias, crearCategoria, eliminarCategoria };
