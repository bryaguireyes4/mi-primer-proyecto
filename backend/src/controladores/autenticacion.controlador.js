const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bd = require('../bd');
const entorno = require('../configuracion/entorno');
const { ErrorAplicacion } = require('../utilidades/errores');

function sanearUsuario(usuario) {
  const { hash_contrasena, ...resto } = usuario;
  return resto;
}

function firmarToken(usuario) {
  return jwt.sign({ sub: usuario.id, rol: usuario.rol }, entorno.secretoJwt, {
    expiresIn: entorno.jwtExpiraEn,
  });
}

function iniciarSesion(req, res, next) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      throw new ErrorAplicacion(400, 'Ingresa tu correo y tu contrasena.');
    }

    const usuario = bd
      .prepare('SELECT * FROM usuarios WHERE correo = ?')
      .get(String(correo).toLowerCase().trim());

    if (!usuario || !bcrypt.compareSync(contrasena, usuario.hash_contrasena)) {
      throw new ErrorAplicacion(401, 'El correo o la contrasena no son correctos.');
    }

    if (!usuario.activo) {
      throw new ErrorAplicacion(403, 'Tu cuenta esta desactivada. Contacta al administrador.');
    }

    const token = firmarToken(usuario);
    res.json({ token, usuario: sanearUsuario(usuario) });
  } catch (error) {
    next(error);
  }
}

function obtenerPerfil(req, res) {
  res.json({ usuario: req.usuario });
}

module.exports = { iniciarSesion, obtenerPerfil, sanearUsuario };
