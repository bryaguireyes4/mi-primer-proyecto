import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cliente, { obtenerMensajeError } from '../api/cliente';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

const formularioVacio = {
  id: null,
  acreedor: '',
  montoTotal: '',
  saldoRestante: '',
  tasaInteres: '',
  pagoMinimoMensual: '',
  fechaPago: '1',
  plazoMeses: '',
};

export function Deudas() {
  const { usuario } = useAutenticacion();
  const [deudas, setDeudas] = useState([]);
  const [recomendacion, setRecomendacion] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const [resDeudas, resRecomendacion] = await Promise.all([
        cliente.get('/deudas'),
        cliente.get('/deudas/recomendacion'),
      ]);
      setDeudas(resDeudas.data.deudas);
      setRecomendacion(resRecomendacion.data);
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardar(evento) {
    evento.preventDefault();
    setError('');
    setAviso('');
    if (!formulario.acreedor || !formulario.montoTotal || !formulario.pagoMinimoMensual) {
      setError('Completa acreedor, monto total y pago minimo mensual.');
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        acreedor: formulario.acreedor,
        montoTotal: Number(formulario.montoTotal),
        saldoRestante: formulario.saldoRestante === '' ? undefined : Number(formulario.saldoRestante),
        tasaInteres: Number(formulario.tasaInteres) || 0,
        pagoMinimoMensual: Number(formulario.pagoMinimoMensual),
        fechaPago: Number(formulario.fechaPago),
        plazoMeses: formulario.plazoMeses === '' ? null : Number(formulario.plazoMeses),
      };
      if (formulario.id) {
        const { data } = await cliente.patch(`/deudas/${formulario.id}`, payload);
        if (data.saldada) {
          setAviso('¡Deuda saldada! La cuota liberada se reasigno a tu meta de ahorro activa.');
        }
      } else {
        await cliente.post('/deudas', payload);
      }
      setFormulario(formularioVacio);
      await cargar();
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  function editar(deuda) {
    setFormulario({
      id: deuda.id,
      acreedor: deuda.acreedor,
      montoTotal: String(deuda.monto_total),
      saldoRestante: String(deuda.saldo_restante),
      tasaInteres: String(deuda.tasa_interes),
      pagoMinimoMensual: String(deuda.pago_minimo_mensual),
      fechaPago: String(deuda.fecha_pago),
      plazoMeses: deuda.plazo_meses ? String(deuda.plazo_meses) : '',
    });
    setAviso('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function eliminar(deuda) {
    const confirmado = window.confirm(`¿Borrar la deuda con "${deuda.acreedor}"?`);
    if (!confirmado) return;
    try {
      await cliente.delete(`/deudas/${deuda.id}`);
      await cargar();
    } catch (error) {
      setError(obtenerMensajeError(error));
    }
  }

  const puedeEditar = (deuda) => usuario.rol === 'admin' || deuda.usuario_id === usuario.id;

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Deudas</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}
      {aviso && <p className="tenue">{aviso}</p>}

      {recomendacion && (
        <div className="tarjeta">
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Recomendacion de este mes</h2>
          <p className="tenue" style={{ margin: 0 }}>
            Disponible: ${recomendacion.disponible.toFixed(2)} · Colchon minimo: $
            {recomendacion.colchonMinimo.toFixed(2)}
          </p>
          <p style={{ marginTop: 'var(--espacio-sm)' }}>{recomendacion.mensaje}</p>
          {recomendacion.deudaRecomendada && (
            <span className="insignia insignia-admin">
              {recomendacion.estrategia === 'avalancha' ? 'Avalancha' : 'Bola de nieve'}:{' '}
              {recomendacion.deudaRecomendada.acreedor}
            </span>
          )}
        </div>
      )}

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>{formulario.id ? 'Editar deuda' : 'Nueva deuda'}</h2>
        <form onSubmit={guardar}>
          <div className="campo">
            <label htmlFor="acreedor">Acreedor</label>
            <input
              id="acreedor"
              value={formulario.acreedor}
              onChange={(e) => setFormulario({ ...formulario, acreedor: e.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="montoTotal">Monto total</label>
            <input
              id="montoTotal"
              type="number"
              step="0.01"
              value={formulario.montoTotal}
              onChange={(e) => setFormulario({ ...formulario, montoTotal: e.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="saldoRestante">Saldo restante (0 = saldada)</label>
            <input
              id="saldoRestante"
              type="number"
              step="0.01"
              value={formulario.saldoRestante}
              onChange={(e) => setFormulario({ ...formulario, saldoRestante: e.target.value })}
            />
          </div>
          <div className="campo">
            <label htmlFor="tasaInteres">Tasa de interes anual (%)</label>
            <input
              id="tasaInteres"
              type="number"
              step="0.01"
              value={formulario.tasaInteres}
              onChange={(e) => setFormulario({ ...formulario, tasaInteres: e.target.value })}
            />
          </div>
          <div className="campo">
            <label htmlFor="pagoMinimoMensual">Pago minimo mensual</label>
            <input
              id="pagoMinimoMensual"
              type="number"
              step="0.01"
              value={formulario.pagoMinimoMensual}
              onChange={(e) => setFormulario({ ...formulario, pagoMinimoMensual: e.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="fechaPago">Dia de pago del mes</label>
            <input
              id="fechaPago"
              type="number"
              min="1"
              max="31"
              value={formulario.fechaPago}
              onChange={(e) => setFormulario({ ...formulario, fechaPago: e.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="plazoMeses">Plazo en meses (opcional)</label>
            <input
              id="plazoMeses"
              type="number"
              value={formulario.plazoMeses}
              onChange={(e) => setFormulario({ ...formulario, plazoMeses: e.target.value })}
            />
          </div>
          <button className="boton boton-primario boton-bloque" type="submit" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Deudas registradas</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : deudas.length === 0 ? (
          <p className="tenue">Aun no hay deudas registradas.</p>
        ) : (
          deudas.map((d) => (
            <div className="fila-usuario" key={d.id}>
              <div>
                <p style={{ margin: 0 }}>
                  {d.acreedor} — ${d.saldo_restante.toFixed(2)} de ${d.monto_total.toFixed(2)}
                </p>
                <p className="tenue" style={{ margin: 0 }}>
                  {d.tasa_interes}% anual · pago minimo ${d.pago_minimo_mensual.toFixed(2)} el dia{' '}
                  {d.fecha_pago}
                  {d.fecha_fin_estimada ? ` · fin estimado ${d.fecha_fin_estimada}` : ''}
                </p>
                {!d.activa && <span className="insignia insignia-admin">Saldada</span>}
              </div>
              {puedeEditar(d) && (
                <div style={{ display: 'flex', gap: 'var(--espacio-sm)' }}>
                  <button className="boton boton-secundario" onClick={() => editar(d)}>
                    Editar
                  </button>
                  <button className="boton boton-peligro" onClick={() => eliminar(d)}>
                    Borrar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
