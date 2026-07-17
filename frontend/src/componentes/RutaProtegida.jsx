import { Navigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

export function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAutenticacion();

  if (cargando) {
    return <div className="pantalla">Cargando...</div>;
  }
  if (!usuario) {
    return <Navigate to="/iniciar-sesion" replace />;
  }
  if (soloAdmin && usuario.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
