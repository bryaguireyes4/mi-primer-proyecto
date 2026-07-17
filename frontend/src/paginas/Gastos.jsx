import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import cliente, { obtenerMensajeError } from '../api/cliente';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

const hoy = () => new Date().toISOString().slice(0, 10);

function formularioVacio(categoriaId) {
  return { id: null, categoriaId: categoriaId || '', monto: '', fecha: hoy(), nota: '', etiquetaId: '' };
}

export function Gastos() {
  const { usuario } = useAutenticacion();
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio());
  const [sugerencia, setSugerencia] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const categoriaMasUsada = useMemo(() => {
    if (gastos.length === 0) return null;
    const conteos = {};
    gastos.forEach((g) => {
      conteos[g.categoria_id] = (conteos[g.categoria_id] || 0) + 1;
    });
    return Object.entries(conteos).sort((a, b) => b[1] - a[1])[0][0];
  }, [gastos]);

  async function cargarTodo() {
    setCargando(true);
    try {
      const [resCategorias, resEtiquetas, resGastos] = await Promise.all([
        cliente.get('/categorias', { params: { tipo: 'gasto' } }),
        cliente.get('/etiquetas'),
        cliente.get('/gastos'),
      ]);
      setCategorias(resCategorias.data.categorias);
      setEtiquetas(resEtiquetas.data.etiquetas);
      setGastos(resGastos.data.gastos);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!formulario.id && categoriaMasUsada && !formulario.categoriaId) {
      setFormulario((actual) => ({ ...actual, categoriaId: categoriaMasUsada }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaMasUsada]);

  async function pedirConfirmacion(evento) {
    evento.preventDefault();
    setError('');
    if (!formulario.categoriaId || !formulario.monto || !formulario.fecha) {
      setError('Completa categoria, monto y fecha.');
      return;
    }
    setEnviando(true);
    try {
      const { data } = await cliente.post('/gastos/sugerir-etiqueta', {
        categoriaId: Number(formulario.categoriaId),
        monto: Number(formulario.monto),
        fecha: formulario.fecha,
      });
      setSugerencia(data.etiqueta);
      setFormulario((actual) => ({ ...actual, etiquetaId: data.etiqueta?.id || '' }));
      setMostrarConfirmacion(true);
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarGuardado() {
    setEnviando(true);
    setError('');
    try {
      const payload = {
        categoriaId: Number(formulario.categoriaId),
        monto: Number(formulario.monto),
        fecha: formulario.fecha,
        nota: formulario.nota,
        etiquetaId: formulario.etiquetaId || null,
      };
      if (formulario.id) {
        await cliente.patch(`/gastos/${formulario.id}`, payload);
      } else {
        await cliente.post('/gastos', payload);
      }
      setFormulario(formularioVacio(categoriaMasUsada));
      setMostrarConfirmacion(false);
      setSugerencia(null);
      await cargarTodo();
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  function editar(gasto) {
    setFormulario({
      id: gasto.id,
      categoriaId: gasto.categoria_id,
      monto: String(gasto.monto),
      fecha: gasto.fecha,
      nota: gasto.nota || '',
      etiquetaId: gasto.etiqueta_id || '',
    });
    setMostrarConfirmacion(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function eliminar(gasto) {
    const confirmado = window.confirm('¿Borrar este gasto? Esta accion no se puede deshacer.');
    if (!confirmado) return;
    try {
      await cliente.delete(`/gastos/${gasto.id}`);
      await cargarTodo();
    } catch (error) {
      setError(obtenerMensajeError(error));
    }
  }

  const puedeEditar = (gasto) => usuario.rol === 'admin' || gasto.usuario_id === usuario.id;

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Gastos</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>{formulario.id ? 'Editar gasto' : 'Registrar gasto'}</h2>
        {!mostrarConfirmacion ? (
          <form onSubmit={pedirConfirmacion}>
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
              Guardar
            </button>
          </form>
        ) : (
          <div>
            <p className="tenue">
              {sugerencia
                ? `Etiqueta sugerida: ${sugerencia.nombre}`
                : 'No hay ninguna etiqueta que coincida con este gasto.'}
            </p>
            <div className="campo">
              <label htmlFor="etiqueta">Etiqueta de tipo de gasto</label>
              <select
                id="etiqueta"
                value={formulario.etiquetaId}
                onChange={(e) => setFormulario({ ...formulario, etiquetaId: e.target.value })}
              >
                <option value="">Sin etiqueta</option>
                {etiquetas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="boton boton-primario boton-bloque"
              onClick={confirmarGuardado}
              disabled={enviando}
              style={{ marginBottom: 'var(--espacio-sm)' }}
            >
              {enviando ? 'Guardando...' : 'Confirmar y guardar'}
            </button>
            <button
              className="boton boton-secundario boton-bloque"
              onClick={() => setMostrarConfirmacion(false)}
            >
              Volver a editar
            </button>
          </div>
        )}
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Historial</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : gastos.length === 0 ? (
          <p className="tenue">Aun no hay gastos registrados.</p>
        ) : (
          gastos.map((g) => (
            <div className="fila-usuario" key={g.id}>
              <div>
                <p style={{ margin: 0 }}>
                  {g.categoria_nombre} — ${g.monto.toFixed(2)}
                </p>
                <p className="tenue" style={{ margin: 0 }}>
                  {g.fecha} · {g.usuario_nombre}
                  {g.etiqueta_nombre ? ` · ${g.etiqueta_nombre}` : ''}
                </p>
                {g.nota && (
                  <p className="tenue" style={{ margin: 0 }}>
                    {g.nota}
                  </p>
                )}
              </div>
              {puedeEditar(g) && (
                <div style={{ display: 'flex', gap: 'var(--espacio-sm)' }}>
                  <button className="boton boton-secundario" onClick={() => editar(g)}>
                    Editar
                  </button>
                  <button className="boton boton-peligro" onClick={() => eliminar(g)}>
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
