const bcrypt = require('bcryptjs');
const bd = require('../bd');
const { ErrorAplicacion } = require('../utilidades/errores');
const { sanearUsuario } = require('./autenticacion.controlador');

const ROLES_VALIDOS = ['admin', 'usuario'];

function listarUsuarios(req, res) {
  const usuarios = bd
    .prepare(
      `SELECT id, family_group_id, nombre, correo, rol, activo, creado_en, actualizado_en
       FROM usuarios WHERE family_group_id = ? ORDER BY nombre ASC`
    )
    .all(req.usuario.family_group_id);
  res.json({ usuarios });
}

function crearUsuario(req, res, next) {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena || !rol) {
      throw new ErrorAplicacion(400, 'Completa nombre, correo, contrasena y rol.');
    }
    if (!ROLES_VALIDOS.includes(rol)) {
      throw new ErrorAplicacion(400, 'El rol debe ser "admin" o "usuario".');
    }
    if (contrasena.length < 8) {
      throw new ErrorAplicacion(400, 'La contrasena debe tener al menos 8 caracteres.');
    }

    const correoNormalizado = String(correo).toLowerCase().trim();
    const existente = bd.prepare('SELECT id FROM usuarios WHERE correo = ?').get(correoNormalizado);
    if (existente) {
      throw new ErrorAplicacion(409, 'Ya existe un usuario con ese correo.');
    }

    const hashContrasena = bcrypt.hashSync(contrasena, 10);
    const resultado = bd
      .prepare(
        `INSERT INTO usuarios (family_group_id, nombre, correo, hash_contrasena, rol, activo)
         VALUES (?, ?, ?, ?, ?, 1)`
      )
      .run(req.usuario.family_group_id, nombre.trim(), correoNormalizado, hashContrasena, rol);

    const usuario = bd.prepare('SELECT * FROM usuarios WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json({ usuario: sanearUsuario(usuario) });
  } catch (error) {
    next(error);
  }
}

function actualizarUsuario(req, res, next) {
  try {
    const idObjetivo = Number(req.params.id);
    const objetivo = bd
      .prepare('SELECT * FROM usuarios WHERE id = ? AND family_group_id = ?')
      .get(idObjetivo, req.usuario.family_group_id);

    if (!objetivo) {
      throw new ErrorAplicacion(404, 'No se encontro ese usuario.');
    }

    const { nombre, correo, contrasena, rol, activo } = req.body;

    if (rol && !ROLES_VALIDOS.includes(rol)) {
      throw new ErrorAplicacion(400, 'El rol debe ser "admin" o "usuario".');
    }
    if (typeof activo === 'boolean' && !activo && idObjetivo === req.usuario.id) {
      throw new ErrorAplicacion(400, 'No puedes desactivar tu propia cuenta.');
    }
    if (rol && rol !== 'admin' && idObjetivo === req.usuario.id) {
      throw new ErrorAplicacion(400, 'No puedes quitarte tu propio rol de administrador.');
    }

    let correoNormalizado = objetivo.correo;
    if (correo) {
      correoNormalizado = String(correo).toLowerCase().trim();
      const existente = bd
        .prepare('SELECT id FROM usuarios WHERE correo = ? AND id != ?')
        .get(correoNormalizado, idObjetivo);
      if (existente) {
        throw new ErrorAplicacion(409, 'Ya existe un usuario con ese correo.');
      }
    }

    if (contrasena && contrasena.length < 8) {
      throw new ErrorAplicacion(400, 'La contrasena debe tener al menos 8 caracteres.');
    }
    const hashContrasena = contrasena ? bcrypt.hashSync(contrasena, 10) : objetivo.hash_contrasena;

    bd.prepare(
      `UPDATE usuarios SET nombre = ?, correo = ?, hash_contrasena = ?, rol = ?, activo = ?, actualizado_en = datetime('now')
       WHERE id = ?`
    ).run(
      nombre ? nombre.trim() : objetivo.nombre,
      correoNormalizado,
      hashContrasena,
      rol || objetivo.rol,
      typeof activo === 'boolean' ? (activo ? 1 : 0) : objetivo.activo,
      idObjetivo
    );

    const actualizado = bd.prepare('SELECT * FROM usuarios WHERE id = ?').get(idObjetivo);
    res.json({ usuario: sanearUsuario(actualizado) });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario };
