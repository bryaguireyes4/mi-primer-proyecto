import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cliente, { obtenerMensajeError } from '../api/cliente';

export function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('gasto');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await cliente.get('/categorias');
      setCategorias(data.categorias);
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(evento) {
    evento.preventDefault();
    setError('');
    if (!nombre.trim()) {
      setError('La categoria necesita un nombre.');
      return;
    }
    setEnviando(true);
    try {
      await cliente.post('/categorias', { nombre, tipo });
      setNombre('');
      await cargar();
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(categoria) {
    const confirmado = window.confirm(`¿Eliminar la categoria "${categoria.nombre}"?`);
    if (!confirmado) return;
    try {
      await cliente.delete(`/categorias/${categoria.id}`);
      await cargar();
    } catch (error) {
      setError(obtenerMensajeError(error));
    }
  }

  const gastos = categorias.filter((c) => c.tipo === 'gasto');
  const ingresos = categorias.filter((c) => c.tipo === 'ingreso');

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Categorias</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Nueva categoria</h2>
        <form onSubmit={crear}>
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="campo">
            <label htmlFor="tipo">Tipo</label>
            <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </select>
          </div>
          <button className="boton boton-primario boton-bloque" type="submit" disabled={enviando}>
            {enviando ? 'Creando...' : 'Crear categoria'}
          </button>
        </form>
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Categorias de gasto</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : (
          gastos.map((c) => (
            <div className="fila-usuario" key={c.id}>
              <p style={{ margin: 0 }}>{c.nombre}</p>
              <button className="boton boton-peligro" onClick={() => eliminar(c)}>
                Borrar
              </button>
            </div>
          ))
        )}
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Categorias de ingreso</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : (
          ingresos.map((c) => (
            <div className="fila-usuario" key={c.id}>
              <p style={{ margin: 0 }}>{c.nombre}</p>
              <button className="boton boton-peligro" onClick={() => eliminar(c)}>
                Borrar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
