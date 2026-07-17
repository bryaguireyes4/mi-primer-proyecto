import { Link } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

export function Panel() {
  const { usuario, cerrarSesion } = useAutenticacion();

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Hola, {usuario.nombre.split(' ')[0]}</h1>
        <button className="boton boton-secundario" onClick={cerrarSesion}>
          Salir
        </button>
      </div>

      <div className="tarjeta">
        <p className="tenue" style={{ marginBottom: 'var(--espacio-md)' }}>
          Registro rapido
        </p>
        <div style={{ display: 'flex', gap: 'var(--espacio-sm)' }}>
          <Link className="boton boton-primario boton-bloque" to="/gastos">
            + Gasto
          </Link>
          <Link className="boton boton-secundario boton-bloque" to="/ingresos">
            + Ingreso
          </Link>
        </div>
      </div>

      <div className="tarjeta">
        <p className="tenue" style={{ marginBottom: 'var(--espacio-md)' }}>
          Finanzas familiares
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espacio-sm)' }}>
          <Link className="boton boton-secundario boton-bloque" to="/deudas">
            Deudas
          </Link>
          <Link className="boton boton-secundario boton-bloque" to="/metas">
            Metas de ahorro
          </Link>
          <Link className="boton boton-secundario boton-bloque" to="/reportes">
            Reportes
          </Link>
        </div>
      </div>

      {usuario.rol === 'admin' && (
        <div className="tarjeta">
          <p className="tenue" style={{ marginBottom: 'var(--espacio-md)' }}>
            Administracion
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espacio-sm)' }}>
            <Link className="boton boton-secundario boton-bloque" to="/usuarios">
              Gestionar usuarios
            </Link>
            <Link className="boton boton-secundario boton-bloque" to="/categorias">
              Categorias
            </Link>
            <Link className="boton boton-secundario boton-bloque" to="/etiquetas">
              Etiquetas de tipo de gasto
            </Link>
            <Link className="boton boton-secundario boton-bloque" to="/presupuestos">
              Presupuestos
            </Link>
            <Link className="boton boton-secundario boton-bloque" to="/configuracion">
              Configuracion financiera
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
