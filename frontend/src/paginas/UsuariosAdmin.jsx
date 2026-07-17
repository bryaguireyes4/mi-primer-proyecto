import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cliente, { obtenerMensajeError } from '../api/cliente';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

const formularioVacio = { nombre: '', correo: '', contrasena: '', rol: 'usuario' };

export function UsuariosAdmin() {
  const { usuario: usuarioActual } = useAutenticacion();
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargarUsuarios() {
    setCargando(true);
    try {
      const { data } = await cliente.get('/usuarios');
      setUsuarios(data.usuarios);
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function manejarCreacion(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await cliente.post('/usuarios', formulario);
      setFormulario(formularioVacio);
      await cargarUsuarios();
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  async function alternarActivo(objetivo) {
    if (objetivo.id === usuarioActual.id) return;
    const confirmado = window.confirm(
      objetivo.activo
        ? `¿Desactivar a ${objetivo.nombre}? No podra iniciar sesion.`
        : `¿Reactivar a ${objetivo.nombre}?`
    );
    if (!confirmado) return;
    try {
      await cliente.patch(`/usuarios/${objetivo.id}`, { activo: !objetivo.activo });
      await cargarUsuarios();
    } catch (error) {
      setError(obtenerMensajeError(error));
    }
  }

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Usuarios</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Crear usuario</h2>
        <form onSubmit={manejarCreacion}>
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              value={formulario.nombre}
              onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="nuevo-correo">Correo</label>
            <input
              id="nuevo-correo"
              type="email"
              value={formulario.correo}
              onChange={(evento) => setFormulario({ ...formulario, correo: evento.target.value })}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="nueva-contrasena">Contrasena</label>
            <input
              id="nueva-contrasena"
              type="password"
              value={formulario.contrasena}
              onChange={(evento) => setFormulario({ ...formulario, contrasena: evento.target.value })}
              minLength={8}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="rol">Rol</label>
            <select
              id="rol"
              value={formulario.rol}
              onChange={(evento) => setFormulario({ ...formulario, rol: evento.target.value })}
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button className="boton boton-primario boton-bloque" type="submit" disabled={enviando}>
            {enviando ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Miembros de la familia</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : (
          usuarios.map((u) => (
            <div className="fila-usuario" key={u.id}>
              <div>
                <p style={{ margin: 0 }}>{u.nombre}</p>
                <p className="tenue" style={{ margin: 0 }}>
                  {u.correo}
                </p>
                <span className={`insignia ${u.rol === 'admin' ? 'insignia-admin' : 'insignia-usuario'}`}>
                  {u.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </span>{' '}
                {!u.activo && <span className="insignia insignia-inactivo">Inactivo</span>}
              </div>
              {u.id !== usuarioActual.id && (
                <button
                  className={`boton ${u.activo ? 'boton-peligro' : 'boton-secundario'}`}
                  onClick={() => alternarActivo(u)}
                >
                  {u.activo ? 'Desactivar' : 'Reactivar'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
