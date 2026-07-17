import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cliente, { obtenerMensajeError } from '../api/cliente';

const mesActual = () => new Date().toISOString().slice(0, 7);

export function PresupuestosAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [mes, setMes] = useState(mesActual());
  const [categoriaId, setCategoriaId] = useState('');
  const [montoLimite, setMontoLimite] = useState('');
  const [porcentajeAlerta, setPorcentajeAlerta] = useState('80');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const [resCategorias, resPresupuestos] = await Promise.all([
        cliente.get('/categorias', { params: { tipo: 'gasto' } }),
        cliente.get('/presupuestos', { params: { mes } }),
      ]);
      setCategorias(resCategorias.data.categorias);
      setPresupuestos(resPresupuestos.data.presupuestos);
      setCategoriaId((actual) => actual || resCategorias.data.categorias[0]?.id || '');
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes]);

  async function crear(evento) {
    evento.preventDefault();
    setError('');
    if (!categoriaId || !montoLimite) {
      setError('Elige una categoria y un monto limite.');
      return;
    }
    setEnviando(true);
    try {
      await cliente.post('/presupuestos', {
        categoriaId: Number(categoriaId),
        mes,
        montoLimite: Number(montoLimite),
        porcentajeAlerta: Number(porcentajeAlerta),
      });
      setMontoLimite('');
      await cargar();
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(presupuesto) {
    const confirmado = window.confirm(`¿Eliminar el presupuesto de "${presupuesto.categoria_nombre}"?`);
    if (!confirmado) return;
    try {
      await cliente.delete(`/presupuestos/${presupuesto.id}`);
      await cargar();
    } catch (error) {
      setError(obtenerMensajeError(error));
    }
  }

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Presupuestos</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}

      <div className="tarjeta">
        <div className="campo">
          <label htmlFor="mes">Mes</label>
          <input id="mes" type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
        </div>
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Nuevo presupuesto</h2>
        <form onSubmit={crear}>
          <div className="campo">
            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="montoLimite">Monto limite</label>
            <input
              id="montoLimite"
              type="number"
              step="0.01"
              value={montoLimite}
              onChange={(e) => setMontoLimite(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="porcentajeAlerta">Alertar al superar (%)</label>
            <input
              id="porcentajeAlerta"
              type="number"
              min="1"
              max="200"
              value={porcentajeAlerta}
              onChange={(e) => setPorcentajeAlerta(e.target.value)}
            />
          </div>
          <button className="boton boton-primario boton-bloque" type="submit" disabled={enviando}>
            {enviando ? 'Creando...' : 'Crear presupuesto'}
          </button>
        </form>
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Presupuestos de {mes}</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : presupuestos.length === 0 ? (
          <p className="tenue">Aun no hay presupuestos para este mes.</p>
        ) : (
          presupuestos.map((p) => {
            const porcentaje = p.monto_limite > 0 ? Math.round((p.gastado / p.monto_limite) * 100) : 0;
            const superado = porcentaje >= p.porcentaje_alerta;
            return (
              <div className="fila-usuario" key={p.id}>
                <div>
                  <p style={{ margin: 0 }}>{p.categoria_nombre}</p>
                  <p className="tenue" style={{ margin: 0 }}>
                    ${p.gastado.toFixed(2)} de ${p.monto_limite.toFixed(2)} ({porcentaje}%)
                  </p>
                  {superado && <span className="insignia insignia-inactivo">Umbral superado</span>}
                </div>
                <button className="boton boton-peligro" onClick={() => eliminar(p)}>
                  Borrar
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
