const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const entorno = require('../configuracion/entorno');

const rutaBd = path.resolve(process.cwd(), entorno.rutaBd);
fs.mkdirSync(path.dirname(rutaBd), { recursive: true });

const bd = new Database(rutaBd);
bd.pragma('journal_mode = WAL');
bd.pragma('foreign_keys = ON');

const esquema = fs.readFileSync(path.join(__dirname, 'esquema.sql'), 'utf8');
bd.exec(esquema);

const CATEGORIAS_GASTO_INICIALES = [
  'Alimentacion',
  'Transporte',
  'Servicios',
  'Salud',
  'Entretenimiento',
  'Hogar',
  'Otros',
];
const CATEGORIAS_INGRESO_INICIALES = ['Salario', 'Freelance', 'Otros'];

function sembrarCategoriasIniciales(idGrupo) {
  const insertarCategoria = bd.prepare(
    'INSERT INTO categorias (family_group_id, nombre, tipo) VALUES (?, ?, ?)'
  );
  CATEGORIAS_GASTO_INICIALES.forEach((nombre) => insertarCategoria.run(idGrupo, nombre, 'gasto'));
  CATEGORIAS_INGRESO_INICIALES.forEach((nombre) => insertarCategoria.run(idGrupo, nombre, 'ingreso'));
}

function sembrarAdminInicial() {
  const totalUsuarios = bd.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total;
  if (totalUsuarios > 0) return;

  const insertarGrupo = bd.prepare('INSERT INTO grupos_familiares (nombre) VALUES (?)');
  const idGrupo = insertarGrupo.run('Familia Principal').lastInsertRowid;

  const hashContrasena = bcrypt.hashSync(entorno.admin.contrasena, 10);
  bd.prepare(
    `INSERT INTO usuarios (family_group_id, nombre, correo, hash_contrasena, rol, activo)
     VALUES (?, ?, ?, ?, 'admin', 1)`
  ).run(idGrupo, entorno.admin.nombre, entorno.admin.correo.toLowerCase(), hashContrasena);

  sembrarCategoriasIniciales(idGrupo);

  bd.prepare(
    'INSERT INTO configuracion_familia (family_group_id, colchon_emergencia_minimo, umbral_diferencia_tasas) VALUES (?, 0, 8)'
  ).run(idGrupo);

  console.log(`Administrador inicial creado: ${entorno.admin.correo}`);
}

sembrarAdminInicial();

module.exports = bd;
