const express = require('express');
const cors = require('cors');
const rutasAutenticacion = require('./rutas/autenticacion.rutas');
const rutasUsuarios = require('./rutas/usuarios.rutas');
const rutasCategorias = require('./rutas/categorias.rutas');
const rutasEtiquetas = require('./rutas/etiquetas.rutas');
const rutasGastos = require('./rutas/gastos.rutas');
const rutasIngresos = require('./rutas/ingresos.rutas');
const rutasDeudas = require('./rutas/deudas.rutas');
const rutasPresupuestos = require('./rutas/presupuestos.rutas');
const rutasConfiguracion = require('./rutas/configuracion.rutas');
const rutasNotificaciones = require('./rutas/notificaciones.rutas');
const rutasMetas = require('./rutas/metas.rutas');
const rutasReportes = require('./rutas/reportes.rutas');
const { ErrorAplicacion } = require('./utilidades/errores');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/estado', (req, res) => res.json({ estado: 'ok' }));

app.use('/api/autenticacion', rutasAutenticacion);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/categorias', rutasCategorias);
app.use('/api/etiquetas', rutasEtiquetas);
app.use('/api/gastos', rutasGastos);
app.use('/api/ingresos', rutasIngresos);
app.use('/api/deudas', rutasDeudas);
app.use('/api/presupuestos', rutasPresupuestos);
app.use('/api/configuracion', rutasConfiguracion);
app.use('/api/notificaciones', rutasNotificaciones);
app.use('/api/metas', rutasMetas);
app.use('/api/reportes', rutasReportes);

app.use((req, res, next) => {
  next(new ErrorAplicacion(404, 'El recurso solicitado no existe.'));
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const codigo = error instanceof ErrorAplicacion ? error.codigo : 500;
  const mensaje =
    error instanceof ErrorAplicacion ? error.message : 'Ocurrio un error inesperado. Intenta de nuevo.';

  if (codigo === 500) {
    console.error(error);
  }

  res.status(codigo).json({ error: mensaje });
});

module.exports = app;
