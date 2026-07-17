import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import cliente, { obtenerMensajeError } from '../api/cliente';

const COLORES = ['#d4af6a', '#e8c88a', '#7fb88a', '#9aa5b8', '#e07a6e', '#6a9ed4', '#c084fc'];

const primerDiaDelMes = () => new Date().toISOString().slice(0, 7) + '-01';
const hoy = () => new Date().toISOString().slice(0, 10);

function TarjetaGrafico({ titulo, datos, claveEtiqueta }) {
  if (!datos || datos.length === 0) {
    return (
      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>{titulo}</h2>
        <p className="tenue">Sin datos en este periodo.</p>
      </div>
    );
  }
  return (
    <div className="tarjeta">
      <h2 style={{ marginTop: 0, fontSize: 16 }}>{titulo}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-borde)" />
          <XAxis dataKey={claveEtiqueta} stroke="var(--color-texto-tenue)" tick={{ fontSize: 11 }} />
          <YAxis stroke="var(--color-texto-tenue)" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'var(--color-superficie)', border: '1px solid var(--color-borde)' }}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {datos.map((_, indice) => (
              <Cell key={indice} fill={COLORES[indice % COLORES.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Reportes() {
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoy());
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await cliente.get('/reportes/resumen', { params: { desde, hasta } });
      setResumen(data);
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Reportes</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}

      <div className="tarjeta">
        <div style={{ display: 'flex', gap: 'var(--espacio-sm)' }}>
          <div className="campo" style={{ flex: 1 }}>
            <label htmlFor="desde">Desde</label>
            <input id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="campo" style={{ flex: 1 }}>
            <label htmlFor="hasta">Hasta</label>
            <input id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        </div>
      </div>

      {cargando || !resumen ? (
        <p className="tenue">Cargando...</p>
      ) : (
        <>
          <div className="tarjeta">
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Balance del periodo</h2>
            <p style={{ margin: 0 }}>
              Ingresos ${resumen.totales.ingresos.toFixed(2)} · Gastos ${resumen.totales.gastos.toFixed(2)}
            </p>
            <p className="tenue" style={{ margin: 0 }}>
              Balance: ${resumen.totales.balance.toFixed(2)}
            </p>
          </div>

          <TarjetaGrafico
            titulo="Gastos por categoria"
            datos={resumen.gastosPorCategoria}
            claveEtiqueta="categoria"
          />
          <TarjetaGrafico
            titulo="Ingresos por categoria"
            datos={resumen.ingresosPorCategoria}
            claveEtiqueta="categoria"
          />
          <TarjetaGrafico
            titulo="Gastos por usuario"
            datos={resumen.gastosPorUsuario}
            claveEtiqueta="usuario"
          />
          <TarjetaGrafico
            titulo="Gastos por etiqueta de tipo de gasto"
            datos={resumen.gastosPorEtiqueta}
            claveEtiqueta="etiqueta"
          />

          <div className="tarjeta">
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Deudas activas y proyeccion</h2>
            {resumen.deudasActivas.length === 0 ? (
              <p className="tenue">No hay deudas activas.</p>
            ) : (
              resumen.deudasActivas.map((d) => (
                <p key={d.id} className="tenue" style={{ margin: '4px 0' }}>
                  {d.acreedor}: ${d.saldo_restante.toFixed(2)} restante ({d.tasa_interes}%)
                </p>
              ))
            )}
            <p style={{ marginTop: 'var(--espacio-sm)' }}>{resumen.proyeccionDeudas.mensaje}</p>
          </div>
        </>
      )}
    </div>
  );
}
