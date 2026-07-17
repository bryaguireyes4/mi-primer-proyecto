import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cliente, { obtenerMensajeError } from '../api/cliente';

const formularioVacio = {
  nombre: '',
  prioridad: 100,
  montoMin: '',
  montoMax: '',
  frecuenciaRepeticiones: '',
  frecuenciaDias: '',
  recurrenciaMeses: '',
  recurrenciaToleranciaPct: '',
  categoriasIds: [],
};

export function EtiquetasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    try {
      const [resCategorias, resEtiquetas] = await Promise.all([
        cliente.get('/categorias', { params: { tipo: 'gasto' } }),
        cliente.get('/etiquetas'),
      ]);
      setCategorias(resCategorias.data.categorias);
      setEtiquetas(resEtiquetas.data.etiquetas);
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  function alternarCategoria(id) {
    setFormulario((actual) => {
      const yaEsta = actual.categoriasIds.includes(id);
      return {
        ...actual,
        categoriasIds: yaEsta
          ? actual.categoriasIds.filter((c) => c !== id)
          : [...actual.categoriasIds, id],
      };
    });
  }

  async function crear(evento) {
    evento.preventDefault();
    setError('');
    if (!formulario.nombre) {
      setError('La etiqueta necesita un nombre.');
      return;
    }
    setEnviando(true);
    try {
      await cliente.post('/etiquetas', {
        nombre: formulario.nombre,
        prioridad: Number(formulario.prioridad) || 100,
        montoMin: formulario.montoMin === '' ? null : Number(formulario.montoMin),
        montoMax: formulario.montoMax === '' ? null : Number(formulario.montoMax),
        frecuenciaRepeticiones:
          formulario.frecuenciaRepeticiones === '' ? null : Number(formulario.frecuenciaRepeticiones),
        frecuenciaDias: formulario.frecuenciaDias === '' ? null : Number(formulario.frecuenciaDias),
        recurrenciaMeses: formulario.recurrenciaMeses === '' ? null : Number(formulario.recurrenciaMeses),
        recurrenciaToleranciaPct:
          formulario.recurrenciaToleranciaPct === '' ? null : Number(formulario.recurrenciaToleranciaPct),
        categoriasIds: formulario.categoriasIds,
      });
      setFormulario(formularioVacio);
      await cargarTodo();
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  async function alternarActiva(etiqueta) {
    try {
      await cliente.patch(`/etiquetas/${etiqueta.id}`, { activa: !etiqueta.activa });
      await cargarTodo();
    } catch (error) {
      setError(obtenerMensajeError(error));
    }
  }

  async function eliminar(etiqueta) {
    const confirmado = window.confirm(`¿Eliminar la etiqueta "${etiqueta.nombre}"?`);
    if (!confirmado) return;
    try {
      await cliente.delete(`/etiquetas/${etiqueta.id}`);
      await cargarTodo();
    } catch (error) {
      setError(obtenerMensajeError(error));
    }
  }

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Etiquetas de tipo de gasto</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Nueva etiqueta</h2>
        <p className="tenue">
          Se evaluan por prioridad (menor numero = se evalua primero) y se sugiere la primera que
          coincide con el gasto.
        </p>
        <form onSubmit={crear}>
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
            <label htmlFor="prioridad">Prioridad</label>
            <input
              id="prioridad"
              type="number"
              value={formulario.prioridad}
              onChange={(e) => setFormulario({ ...formulario, prioridad: e.target.value })}
            />
          </div>
          <div className="campo">
            <label>Categorias aplicables (ninguna = todas)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--espacio-sm)' }}>
              {categorias.map((c) => (
                <label
                  key={c.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}
                >
                  <input
                    type="checkbox"
                    checked={formulario.categoriasIds.includes(c.id)}
                    onChange={() => alternarCategoria(c.id)}
                  />
                  {c.nombre}
                </label>
              ))}
            </div>
          </div>
          <div className="campo">
            <label htmlFor="montoMin">Monto minimo (opcional)</label>
            <input
              id="montoMin"
              type="number"
              step="0.01"
              value={formulario.montoMin}
              onChange={(e) => setFormulario({ ...formulario, montoMin: e.target.value })}
            />
          </div>
          <div className="campo">
            <label htmlFor="montoMax">Monto maximo (opcional)</label>
            <input
              id="montoMax"
              type="number"
              step="0.01"
              value={formulario.montoMax}
              onChange={(e) => setFormulario({ ...formulario, montoMax: e.target.value })}
            />
          </div>
          <div className="campo">
            <label htmlFor="frecuenciaRepeticiones">Repeticiones minimas (frecuencia)</label>
            <input
              id="frecuenciaRepeticiones"
              type="number"
              value={formulario.frecuenciaRepeticiones}
              onChange={(e) => setFormulario({ ...formulario, frecuenciaRepeticiones: e.target.value })}
            />
          </div>
          <div className="campo">
            <label htmlFor="frecuenciaDias">En los ultimos N dias</label>
            <input
              id="frecuenciaDias"
              type="number"
              value={formulario.frecuenciaDias}
              onChange={(e) => setFormulario({ ...formulario, frecuenciaDias: e.target.value })}
            />
          </div>
          <div className="campo">
            <label htmlFor="recurrenciaMeses">Recurrencia: mismo monto en N meses</label>
            <input
              id="recurrenciaMeses"
              type="number"
              value={formulario.recurrenciaMeses}
              onChange={(e) => setFormulario({ ...formulario, recurrenciaMeses: e.target.value })}
            />
          </div>
          <div className="campo">
            <label htmlFor="recurrenciaToleranciaPct">Tolerancia de monto (%)</label>
            <input
              id="recurrenciaToleranciaPct"
              type="number"
              value={formulario.recurrenciaToleranciaPct}
              onChange={(e) =>
                setFormulario({ ...formulario, recurrenciaToleranciaPct: e.target.value })
              }
            />
          </div>
          <button className="boton boton-primario boton-bloque" type="submit" disabled={enviando}>
            {enviando ? 'Creando...' : 'Crear etiqueta'}
          </button>
        </form>
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Etiquetas configuradas</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : etiquetas.length === 0 ? (
          <p className="tenue">Aun no hay etiquetas.</p>
        ) : (
          etiquetas.map((e) => (
            <div className="fila-usuario" key={e.id}>
              <div>
                <p style={{ margin: 0 }}>
                  {e.nombre} <span className="tenue">(prioridad {e.prioridad})</span>
                </p>
                {!e.activa && <span className="insignia insignia-inactivo">Inactiva</span>}
              </div>
              <div style={{ display: 'flex', gap: 'var(--espacio-sm)' }}>
                <button className="boton boton-secundario" onClick={() => alternarActiva(e)}>
                  {e.activa ? 'Desactivar' : 'Activar'}
                </button>
                <button className="boton boton-peligro" onClick={() => eliminar(e)}>
                  Borrar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
