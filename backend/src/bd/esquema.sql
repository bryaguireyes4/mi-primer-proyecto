-- Fase 1: grupos familiares (preparado para multi-tenant, v1 usa un solo grupo) y usuarios con roles.
-- La columna family_group_id se mantiene con ese nombre porque asi la define el modelo de datos multi-tenant acordado.

CREATE TABLE IF NOT EXISTS grupos_familiares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_group_id INTEGER NOT NULL REFERENCES grupos_familiares(id),
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  hash_contrasena TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'usuario')),
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_grupo_familiar ON usuarios(family_group_id);
