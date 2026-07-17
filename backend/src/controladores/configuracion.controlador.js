const bd = require('../bd');

function obtenerConfiguracion(req, res) {
  const configuracion = bd
    .prepare('SELECT * FROM configuracion_familia WHERE family_group_id = ?')
    .get(req.usuario.family_group_id);
  res.json({ configuracion });
}

function actualizarConfiguracion(req, res, next) {
  try {
    const { colchonEmergenciaMinimo, umbralDiferenciaTasas } = req.body;
    const actual = bd
      .prepare('SELECT * FROM configuracion_familia WHERE family_group_id = ?')
      .get(req.usuario.family_group_id);

    bd.prepare(
      'UPDATE configuracion_familia SET colchon_emergencia_minimo = ?, umbral_diferencia_tasas = ? WHERE family_group_id = ?'
    ).run(
      colchonEmergenciaMinimo != null ? Number(colchonEmergenciaMinimo) : actual.colchon_emergencia_minimo,
      umbralDiferenciaTasas != null ? Number(umbralDiferenciaTasas) : actual.umbral_diferencia_tasas,
      req.usuario.family_group_id
    );

    const actualizada = bd
      .prepare('SELECT * FROM configuracion_familia WHERE family_group_id = ?')
      .get(req.usuario.family_group_id);
    res.json({ configuracion: actualizada });
  } catch (error) {
    next(error);
  }
}

module.exports = { obtenerConfiguracion, actualizarConfiguracion };
