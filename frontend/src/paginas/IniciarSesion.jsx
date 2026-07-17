import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

export function IniciarSesion() {
  const { usuario, iniciarSesion } = useAutenticacion();
  const navegar = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    const resultado = await iniciarSesion(correo, contrasena);
    setEnviando(false);
    if (resultado.ok) {
      navegar('/');
    } else {
      setError(resultado.mensaje);
    }
  }

  return (
    <div className="pantalla" style={{ justifyContent: 'center' }}>
      <div className="tarjeta">
        <h1 style={{ marginTop: 0 }}>Finanzas del Hogar</h1>
        <p className="tenue" style={{ marginBottom: 'var(--espacio-lg)' }}>
          Inicia sesion para continuar
        </p>
        <form onSubmit={manejarEnvio}>
          <div className="campo">
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="email"
              autoComplete="username"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="contrasena">Contrasena</label>
            <input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              required
            />
          </div>
          {error && <p className="texto-error">{error}</p>}
          <button className="boton boton-primario boton-bloque" type="submit" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
