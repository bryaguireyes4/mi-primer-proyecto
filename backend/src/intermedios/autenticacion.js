const jwt = require('jsonwebtoken');
const entorno = require('../configuracion/entorno');
const bd = require('../bd');
const { ErrorAplicacion } = require('../utilidades/errores');

function autenticar(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [esquema, token] = encabezado.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return next(new ErrorAplicacion(401, 'Debes iniciar sesion para continuar.'));
  }

  try {
    const payload = jwt.verify(token, entorno.secretoJwt);
    const usuario = bd
      .prepare('SELECT id, family_group_id, nombre, correo, rol, activo FROM usuarios WHERE id = ?')
      .get(payload.sub);

    if (!usuario || !usuario.activo) {
      return next(new ErrorAplicacion(401, 'Tu sesion ya no es valida. Inicia sesion nuevamente.'));
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    next(new ErrorAplicacion(401, 'Tu sesion expiro o no es valida. Inicia sesion nuevamente.'));
  }
}

function requerirAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return next(new ErrorAplicacion(403, 'Solo un administrador puede realizar esta accion.'));
  }
  next();
}

module.exports = { autenticar, requerirAdmin };
