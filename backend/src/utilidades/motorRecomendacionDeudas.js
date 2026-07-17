const bd = require('../bd');

/**
 * Calcula la recomendacion mensual de pago de deudas para un grupo familiar:
 * disponible = ingresos del mes - gastos del mes - suma de pagos minimos de deudas activas.
 * Si el excedente rompe el colchon de emergencia minimo, no se recomienda pago extra.
 * Si hay excedente, se elige avalancha (mayor tasa) o bola de nieve (menor saldo)
 * segun la diferencia de tasas entre las deudas activas frente al umbral configurado.
 */
function calcularRecomendacion(familyGroupId, mes) {
  const configuracion = bd
    .prepare('SELECT * FROM configuracion_familia WHERE family_group_id = ?')
    .get(familyGroupId);

  const ingresosMes = bd
    .prepare("SELECT COALESCE(SUM(monto), 0) AS total FROM ingresos WHERE family_group_id = ? AND fecha LIKE ?")
    .get(familyGroupId, `${mes}%`).total;

  const gastosMes = bd
    .prepare("SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE family_group_id = ? AND fecha LIKE ?")
    .get(familyGroupId, `${mes}%`).total;

  const deudasActivas = bd
    .prepare('SELECT * FROM deudas WHERE family_group_id = ? AND activa = 1 ORDER BY tasa_interes DESC')
    .all(familyGroupId);

  const sumaPagosMinimos = deudasActivas.reduce((total, deuda) => total + deuda.pago_minimo_mensual, 0);

  const disponible = ingresosMes - gastosMes - sumaPagosMinimos;
  const colchonMinimo = configuracion.colchon_emergencia_minimo;
  const excedente = disponible - colchonMinimo;

  if (deudasActivas.length === 0) {
    return {
      ingresosMes,
      gastosMes,
      sumaPagosMinimos,
      disponible,
      colchonMinimo,
      excedente,
      estrategia: null,
      deudaRecomendada: null,
      mensaje: 'No tienes deudas activas por pagar.',
    };
  }

  if (excedente <= 0) {
    return {
      ingresosMes,
      gastosMes,
      sumaPagosMinimos,
      disponible,
      colchonMinimo,
      excedente,
      estrategia: null,
      deudaRecomendada: null,
      mensaje: 'No hay excedente disponible este mes sin romper el colchon de emergencia. Solo cubre los pagos minimos.',
    };
  }

  const tasaMax = Math.max(...deudasActivas.map((d) => d.tasa_interes));
  const tasaMin = Math.min(...deudasActivas.map((d) => d.tasa_interes));
  const diferenciaTasas = tasaMax - tasaMin;

  let estrategia;
  let deudaRecomendada;

  if (deudasActivas.length === 1 || diferenciaTasas >= configuracion.umbral_diferencia_tasas) {
    estrategia = 'avalancha';
    deudaRecomendada = deudasActivas.reduce((mayor, d) => (d.tasa_interes > mayor.tasa_interes ? d : mayor));
  } else {
    estrategia = 'bola_de_nieve';
    deudaRecomendada = deudasActivas.reduce((menor, d) => (d.saldo_restante < menor.saldo_restante ? d : menor));
  }

  return {
    ingresosMes,
    gastosMes,
    sumaPagosMinimos,
    disponible,
    colchonMinimo,
    excedente,
    estrategia,
    deudaRecomendada,
    mensaje: `Hay $${excedente.toFixed(2)} disponibles para abonar de mas. Estrategia recomendada: ${
      estrategia === 'avalancha' ? 'avalancha (mayor tasa de interes)' : 'bola de nieve (menor saldo restante)'
    }.`,
  };
}

module.exports = { calcularRecomendacion };
