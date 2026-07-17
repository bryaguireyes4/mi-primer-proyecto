const bd = require('../bd');

function obtenerCategoriasAplicables(etiquetaId) {
  return bd
    .prepare('SELECT categoria_id FROM etiquetas_categorias WHERE etiqueta_id = ?')
    .all(etiquetaId)
    .map((fila) => fila.categoria_id);
}

function cumpleRangoMonto(etiqueta, monto) {
  if (etiqueta.monto_min != null && monto < etiqueta.monto_min) return false;
  if (etiqueta.monto_max != null && monto > etiqueta.monto_max) return false;
  return true;
}

function cumpleFrecuencia(etiqueta, familyGroupId, categoriaId, fecha, usuarioId) {
  if (!etiqueta.frecuencia_repeticiones || !etiqueta.frecuencia_dias) return true;

  const fechaLimite = new Date(fecha);
  fechaLimite.setDate(fechaLimite.getDate() - etiqueta.frecuencia_dias);
  const fechaLimiteTexto = fechaLimite.toISOString().slice(0, 10);

  const total = bd
    .prepare(
      `SELECT COUNT(*) AS total FROM gastos
       WHERE family_group_id = ? AND categoria_id = ? AND usuario_id = ?
         AND fecha >= ? AND fecha < ?`
    )
    .get(familyGroupId, categoriaId, usuarioId, fechaLimiteTexto, fecha).total;

  return total >= etiqueta.frecuencia_repeticiones - 1; // -1: el gasto actual cuenta como una repeticion mas
}

function cumpleRecurrencia(etiqueta, familyGroupId, categoriaId, monto, fecha, usuarioId) {
  if (!etiqueta.recurrencia_meses) return true;

  const tolerancia = (etiqueta.recurrencia_tolerancia_pct ?? 5) / 100;
  const montoMin = monto * (1 - tolerancia);
  const montoMax = monto * (1 + tolerancia);
  const diaDelMes = new Date(fecha).getUTCDate();

  const candidatos = bd
    .prepare(
      `SELECT fecha, monto FROM gastos
       WHERE family_group_id = ? AND categoria_id = ? AND usuario_id = ?
         AND monto >= ? AND monto <= ? AND fecha < ?`
    )
    .all(familyGroupId, categoriaId, usuarioId, montoMin, montoMax, fecha);

  const mesesConCoincidencia = new Set();
  for (const candidato of candidatos) {
    const fechaCandidato = new Date(candidato.fecha);
    const diaCandidato = fechaCandidato.getUTCDate();
    if (Math.abs(diaCandidato - diaDelMes) <= 3) {
      const clave = `${fechaCandidato.getUTCFullYear()}-${fechaCandidato.getUTCMonth()}`;
      mesesConCoincidencia.add(clave);
    }
  }

  return mesesConCoincidencia.size >= etiqueta.recurrencia_meses - 1;
}

/**
 * Evalua las etiquetas activas del grupo familiar, ordenadas por prioridad,
 * y devuelve la primera que coincide con el gasto propuesto (o null).
 */
function sugerirEtiqueta({ familyGroupId, usuarioId, categoriaId, monto, fecha }) {
  const etiquetas = bd
    .prepare(
      'SELECT * FROM etiquetas WHERE family_group_id = ? AND activa = 1 ORDER BY prioridad ASC'
    )
    .all(familyGroupId);

  for (const etiqueta of etiquetas) {
    const categoriasAplicables = obtenerCategoriasAplicables(etiqueta.id);
    if (categoriasAplicables.length > 0 && !categoriasAplicables.includes(categoriaId)) {
      continue;
    }
    if (!cumpleRangoMonto(etiqueta, monto)) continue;
    if (!cumpleFrecuencia(etiqueta, familyGroupId, categoriaId, fecha, usuarioId)) continue;
    if (!cumpleRecurrencia(etiqueta, familyGroupId, categoriaId, monto, fecha, usuarioId)) continue;

    return etiqueta;
  }

  return null;
}

module.exports = { sugerirEtiqueta };
