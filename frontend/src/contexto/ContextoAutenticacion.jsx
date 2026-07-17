import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import cliente, { obtenerMensajeError } from '../api/cliente';

const ContextoAutenticacion = createContext(null);

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCargando(false);
      return;
    }
    cliente
      .get('/autenticacion/perfil')
      .then(({ data }) => setUsuario(data.usuario))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback(async (correo, contrasena) => {
    try {
      const { data } = await cliente.post('/autenticacion/iniciar-sesion', { correo, contrasena });
      localStorage.setItem('token', data.token);
      setUsuario(data.usuario);
      return { ok: true };
    } catch (error) {
      return { ok: false, mensaje: obtenerMensajeError(error) };
    }
  }, []);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('token');
    setUsuario(null);
  }, []);

  return (
    <ContextoAutenticacion.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}

export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de ProveedorAutenticacion');
  }
  return contexto;
}
