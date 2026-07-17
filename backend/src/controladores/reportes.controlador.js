const bd = require('../bd');
const { calcularRecomendacion } = require('../utilidades/motorRecomendacionDeudas');

function obtenerResumen(req, res) {
  const desde = req.query.desde || '0000-01-01';
  const hasta = req.query.hasta || '9999-12-31';
  const familyGroupId = req.usuario.family_group_id;

  const gastosPorCategoria = bd
    .prepare(
      `SELECT c.nombre AS categoria, COALESCE(SUM(g.monto), 0) AS total
       FROM gastos g JOIN categorias c ON c.id = g.categoria_id
       WHERE g.family_group_id = ? AND g.fecha BETWEEN ? AND ?
       GROUP BY c.id ORDER BY total DESC`
    )
    .all(familyGroupId, desde, hasta);

  const ingresosPorCategoria = bd
    .prepare(
      `SELECT c.nombre AS categoria, COALESCE(SUM(i.monto), 0) AS total
       FROM ingresos i JOIN categorias c ON c.id = i.categoria_id
       WHERE i.family_group_id = ? AND i.fecha BETWEEN ? AND ?
       GROUP BY c.id ORDER BY total DESC`
    )
    .all(familyGroupId, desde, hasta);

  const gastosPorUsuario = bd
    .prepare(
      `SELECT u.nombre AS usuario, COALESCE(SUM(g.monto), 0) AS total
       FROM gastos g JOIN usuarios u ON u.id = g.usuario_id
       WHERE g.family_group_id = ? AND g.fecha BETWEEN ? AND ?
       GROUP BY u.id ORDER BY total DESC`
    )
    .all(familyGroupId, desde, hasta);

  const gastosPorEtiqueta = bd
    .prepare(
      `SELECT COALESCE(e.nombre, 'Sin etiqueta') AS etiqueta, COALESCE(SUM(g.monto), 0) AS total
       FROM gastos g LEFT JOIN etiquetas e ON e.id = g.etiqueta_id
       WHERE g.family_group_id = ? AND g.fecha BETWEEN ? AND ?
       GROUP BY etiqueta ORDER BY total DESC`
    )
    .all(familyGroupId, desde, hasta);

  const totalIngresos = bd
    .prepare('SELECT COALESCE(SUM(monto), 0) AS total FROM ingresos WHERE family_group_id = ? AND fecha BETWEEN ? AND ?')
    .get(familyGroupId, desde, hasta).total;

  const totalGastos = bd
    .prepare('SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE family_group_id = ? AND fecha BETWEEN ? AND ?')
    .get(familyGroupId, desde, hasta).total;

  const deudasActivas = bd
    .prepare('SELECT * FROM deudas WHERE family_group_id = ? AND activa = 1 ORDER BY tasa_interes DESC')
    .all(familyGroupId);

  const mesActual = new Date().toISOString().slice(0, 7);
  const proyeccionDeudas = calcularRecomendacion(familyGroupId, mesActual);

  res.json({
    periodo: { desde, hasta },
    gastosPorCategoria,
    ingresosPorCategoria,
    gastosPorUsuario,
    gastosPorEtiqueta,
    totales: { ingresos: totalIngresos, gastos: totalGastos, balance: totalIngresos - totalGastos },
    deudasActivas,
    proyeccionDeudas,
  });
}

module.exports = { obtenerResumen };
