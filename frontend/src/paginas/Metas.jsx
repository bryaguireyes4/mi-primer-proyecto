import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cliente, { obtenerMensajeError } from '../api/cliente';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

const formularioVacio = { id: null, nombre: '', montoObjetivo: '', montoAcumulado: '' };

export function Metas() {
  const { usuario } = useAutenticacion();
  const [metas, setMetas] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await cliente.get('/metas');
      setMetas(data.metas);
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
    if (!formulario.nombre || !formulario.montoObjetivo) {
      setError('Indica un nombre y un monto objetivo.');
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        nombre: formulario.nombre,
        montoObjetivo: Number(formulario.montoObjetivo),
        montoAcumulado: Number(formulario.montoAcumulado) || 0,
      };
      if (formulario.id) {
        await cliente.patch(`/metas/${formulario.id}`, payload);
      } else {
        await cliente.post('/metas', payload);
      }
      setFormulario(formularioVacio);
      await cargar();
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  function editar(meta) {
    setFormulario({
      id: meta.id,
      nombre: meta.nombre,
      montoObjetivo: String(meta.monto_objetivo),
      montoAcumulado: String(meta.monto_acumulado),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function eliminar(meta) {
    const confirmado = window.confirm(`¿Borrar la meta "${meta.nombre}"?`);
    if (!confirmado) return;
    try {
      await cliente.delete(`/metas/${meta.id}`);
      await cargar();
    } catch (error) {
      setError(obtenerMensajeError(error));
    }
  }

  const puedeEditar = (meta) => usuario.rol === 'admin' || meta.usuario_id === usuario.id;

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Metas de ahorro</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>{formulario.id ? 'Editar meta' : 'Nueva meta'}</h2>
        <form onSubmit={guardar}>
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              value={formulario.nombre}
              onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="montoObjetivo">Monto objetivo</label>
            <input
              id="montoObjetivo"
              type="number"
              step="0.01"
              value={formulario.montoObjetivo}
              onChange={(e) => setFormulario({ ...formulario, montoObjetivo: e.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="montoAcumulado">Monto acumulado</label>
            <input
              id="montoAcumulado"
              type="number"
              step="0.01"
              value={formulario.montoAcumulado}
              onChange={(e) => setFormulario({ ...formulario, montoAcumulado: e.target.value })}
            />
          </div>
          <button className="boton boton-primario boton-bloque" type="submit" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Progreso</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : metas.length === 0 ? (
          <p className="tenue">Aun no hay metas de ahorro.</p>
        ) : (
          metas.map((m) => {
            const porcentaje = Math.min(100, Math.round((m.monto_acumulado / m.monto_objetivo) * 100));
            return (
              <div key={m.id} style={{ marginBottom: 'var(--espacio-md)' }}>
                <div className="fila-usuario" style={{ border: 'none', padding: 0 }}>
                  <div>
                    <p style={{ margin: 0 }}>{m.nombre}</p>
                    <p className="tenue" style={{ margin: 0 }}>
                      ${m.monto_acumulado.toFixed(2)} de ${m.monto_objetivo.toFixed(2)} ({porcentaje}%)
                      {m.aporte_mensual > 0 ? ` · aporte mensual $${m.aporte_mensual.toFixed(2)}` : ''}
                    </p>
                  </div>
                  {puedeEditar(m) && (
                    <div style={{ display: 'flex', gap: 'var(--espacio-sm)' }}>
                      <button className="boton boton-secundario" onClick={() => editar(m)}>
                        Editar
                      </button>
                      <button className="boton boton-peligro" onClick={() => eliminar(m)}>
                        Borrar
                      </button>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    background: 'var(--color-fondo-elevado)',
                    borderRadius: 999,
                    height: 10,
                    overflow: 'hidden',
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      width: `${porcentaje}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--color-acento), var(--color-acento-fuerte))',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
