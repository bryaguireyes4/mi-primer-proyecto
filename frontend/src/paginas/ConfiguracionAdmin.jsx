import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cliente, { obtenerMensajeError } from '../api/cliente';
import { activarNotificaciones } from '../utilidades/push';

export function ConfiguracionAdmin() {
  const [colchon, setColchon] = useState('0');
  const [umbral, setUmbral] = useState('8');
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cliente
      .get('/configuracion')
      .then(({ data }) => {
        setColchon(String(data.configuracion.colchon_emergencia_minimo));
        setUmbral(String(data.configuracion.umbral_diferencia_tasas));
      })
      .catch((error) => setError(obtenerMensajeError(error)))
      .finally(() => setCargando(false));
  }, []);

  async function guardar(evento) {
    evento.preventDefault();
    setError('');
    setMensajeExito('');
    setGuardando(true);
    try {
      await cliente.patch('/configuracion', {
        colchonEmergenciaMinimo: Number(colchon),
        umbralDiferenciaTasas: Number(umbral),
      });
      setMensajeExito('Configuracion guardada.');
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setGuardando(false);
    }
  }

  async function activarPush() {
    setError('');
    setMensajeExito('');
    try {
      await activarNotificaciones();
      setMensajeExito('Notificaciones activadas en este dispositivo.');
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Configuracion financiera</h1>
        <Link className="boton boton-secundario" to="/">
          Volver
        </Link>
      </div>

      {error && <p className="texto-error">{error}</p>}
      {mensajeExito && <p className="tenue">{mensajeExito}</p>}

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Motor de recomendacion de deudas</h2>
        {cargando ? (
          <p className="tenue">Cargando...</p>
        ) : (
          <form onSubmit={guardar}>
            <div className="campo">
              <label htmlFor="colchon">Colchon de emergencia minimo (USD)</label>
              <input
                id="colchon"
                type="number"
                step="0.01"
                value={colchon}
                onChange={(e) => setColchon(e.target.value)}
              />
            </div>
            <div className="campo">
              <label htmlFor="umbral">Umbral de diferencia de tasas (puntos porcentuales)</label>
              <input
                id="umbral"
                type="number"
                step="0.1"
                value={umbral}
                onChange={(e) => setUmbral(e.target.value)}
              />
            </div>
            <button className="boton boton-primario boton-bloque" type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        )}
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Notificaciones push</h2>
        <p className="tenue">
          Activa las alertas para recibir un aviso en este telefono cuando un presupuesto este por
          agotarse.
        </p>
        <button className="boton boton-secundario boton-bloque" onClick={activarPush}>
          Activar notificaciones en este dispositivo
        </button>
      </div>
    </div>
  );
}
