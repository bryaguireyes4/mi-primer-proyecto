import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cliente, { obtenerMensajeError } from '../api/cliente';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

const hoy = () => new Date().toISOString().slice(0, 10);

function formularioVacio(categoriaId) {
  return { id: null, categoriaId: categoriaId || '', monto: '', fecha: hoy(), nota: '' };
}

export function Ingresos() {
  const { usuario } = useAutenticacion();
  const [categorias, setCategorias] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio());
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    try {
      const [resCategorias, resIngresos] = await Promise.all([
        cliente.get('/categorias', { params: { tipo: 'ingreso' } }),
        cliente.get('/ingresos'),
      ]);
      setCategorias(resCategorias.data.categorias);
      setIngresos(resIngresos.data.ingresos);
      setFormulario((actual) =>
        actual.categoriaId ? actual : formularioVacio(resCategorias.data.categorias[0]?.id)
      );
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  async function guardar(evento) {
    evento.preventDefault();
    setError('');
    if (!formulario.categoriaId || !formulario.monto || !formulario.fecha) {
      setError('Completa categoria, monto y fecha.');
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        categoriaId: Number(formulario.categoriaId),
        monto: Number(formulario.monto),
        fecha: formulario.fecha,
        nota: formulario.nota,
      };
      if (formulario.id) {
        await cliente.patch(`/ingresos/${formulario.id}`, payload);
      } else {
        await cliente.post('/ingresos', payload);
      }
      setFormulario(formularioVacio(formulario.categoriaId));
      await cargarTodo();
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  function editar(ingreso) {
    setFormulario({
      id: ingreso.id,
      categoriaId: ingreso.categoria_id,
      monto: String(ingreso.monto),
      fecha: ingreso.fecha,
      nota: ingreso.nota || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function eliminar(ingreso) {
    const confirmado = window.confirm('¿Borrar este ingreso? Esta accion no se puede deshacer.');
    if (!confirmado) return;
    try {
      await cliente.delete(`/ingresos/${ingreso.id}`);
      await cargarTodo();
    } catch (error) {
      setError(obtenerMensajeError(error));
    }
  }

  const puedeEditar = (ingreso) => usuario.rol === 'admin' || ingreso.usuario_id === usuario.id;

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Ingresos</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>{formulario.id ? 'Editar ingreso' : 'Registrar ingreso'}</h2>
        <form onSubmit={guardar}>
          <div className="campo">
            <label htmlFor="monto">Monto (USD)</label>
            <input
              id="monto"
              type="number"
              step="0.01"
              min="0.01"
              autoFocus
              value={formulario.monto}
              onChange={(e) => setFormulario({ ...formulario, monto: e.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="categoria">Categoria</label>
            <select
              id="categoria"
              value={formulario.categoriaId}
              onChange={(e) => setFormulario({ ...formulario, categoriaId: e.target.value })}
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              type="date"
              value={formulario.fecha}
              onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="nota">Nota (opcional)</label>
            <input
              id="nota"
              value={formulario.nota}
              onChange={(e) => setFormulario({ ...formulario, nota: e.target.value })}
            />
          </div>
          <button className="boton boton-primario boton-bloque" type="submit" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Historial</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : ingresos.length === 0 ? (
          <p className="tenue">Aun no hay ingresos registrados.</p>
        ) : (
          ingresos.map((i) => (
            <div className="fila-usuario" key={i.id}>
              <div>
                <p style={{ margin: 0 }}>
                  {i.categoria_nombre} — ${i.monto.toFixed(2)}
                </p>
                <p className="tenue" style={{ margin: 0 }}>
                  {i.fecha} · {i.usuario_nombre}
                </p>
                {i.nota && (
                  <p className="tenue" style={{ margin: 0 }}>
                    {i.nota}
                  </p>
                )}
              </div>
              {puedeEditar(i) && (
                <div style={{ display: 'flex', gap: 'var(--espacio-sm)' }}>
                  <button className="boton boton-secundario" onClick={() => editar(i)}>
                    Editar
                  </button>
                  <button className="boton boton-peligro" onClick={() => eliminar(i)}>
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
