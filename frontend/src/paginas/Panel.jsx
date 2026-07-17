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
        <p className="tenue">Rol</p>
        <span className={`insignia ${usuario.rol === 'admin' ? 'insignia-admin' : 'insignia-usuario'}`}>
          {usuario.rol === 'admin' ? 'Administrador' : 'Usuario'}
        </span>
      </div>

      <div className="tarjeta">
        <p className="tenue" style={{ marginBottom: 0 }}>
          Los modulos de gastos, ingresos, deudas, presupuestos, metas y reportes
          llegan en las siguientes fases de entrega.
        </p>
      </div>

      {usuario.rol === 'admin' && (
        <Link className="boton boton-secundario boton-bloque" to="/usuarios">
          Gestionar usuarios
        </Link>
      )}
    </div>
  );
}
