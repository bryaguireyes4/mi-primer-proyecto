import axios from 'axios';

const cliente = axios.create({ baseURL: '/api' });

cliente.interceptors.request.use((configuracion) => {
  const token = localStorage.getItem('token');
  if (token) {
    configuracion.headers.Authorization = `Bearer ${token}`;
  }
  return configuracion;
});

export function obtenerMensajeError(error) {
  return (
    error?.response?.data?.error ||
    'No se pudo conectar con el servidor. Intenta de nuevo.'
  );
}

export default cliente;
