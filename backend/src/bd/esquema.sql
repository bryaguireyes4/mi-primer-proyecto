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

-- Fase 2: categorias, etiquetas de tipo de gasto (motor heuristico), gastos e ingresos.

CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_group_id INTEGER NOT NULL REFERENCES grupos_familiares(id),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('gasto', 'ingreso')),
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (family_group_id, nombre, tipo)
);

CREATE TABLE IF NOT EXISTS etiquetas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_group_id INTEGER NOT NULL REFERENCES grupos_familiares(id),
  nombre TEXT NOT NULL,
  prioridad INTEGER NOT NULL DEFAULT 100,
  monto_min REAL,
  monto_max REAL,
  frecuencia_repeticiones INTEGER,
  frecuencia_dias INTEGER,
  recurrencia_meses INTEGER,
  recurrencia_tolerancia_pct REAL,
  activa INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (family_group_id, nombre)
);

CREATE TABLE IF NOT EXISTS etiquetas_categorias (
  etiqueta_id INTEGER NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (etiqueta_id, categoria_id)
);

CREATE TABLE IF NOT EXISTS gastos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_group_id INTEGER NOT NULL REFERENCES grupos_familiares(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  etiqueta_id INTEGER REFERENCES etiquetas(id),
  monto REAL NOT NULL,
  fecha TEXT NOT NULL,
  nota TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gastos_grupo_familiar ON gastos(family_group_id);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);

CREATE TABLE IF NOT EXISTS ingresos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_group_id INTEGER NOT NULL REFERENCES grupos_familiares(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  monto REAL NOT NULL,
  fecha TEXT NOT NULL,
  nota TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ingresos_grupo_familiar ON ingresos(family_group_id);
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON ingresos(fecha);

-- Fase 3: deudas y presupuestos mensuales por categoria.

CREATE TABLE IF NOT EXISTS deudas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_group_id INTEGER NOT NULL REFERENCES grupos_familiares(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  acreedor TEXT NOT NULL,
  monto_total REAL NOT NULL,
  saldo_restante REAL NOT NULL,
  tasa_interes REAL NOT NULL DEFAULT 0,
  pago_minimo_mensual REAL NOT NULL,
  fecha_pago INTEGER NOT NULL,
  plazo_meses INTEGER,
  fecha_fin_estimada TEXT,
  activa INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_deudas_grupo_familiar ON deudas(family_group_id);

CREATE TABLE IF NOT EXISTS presupuestos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_group_id INTEGER NOT NULL REFERENCES grupos_familiares(id),
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  mes TEXT NOT NULL,
  monto_limite REAL NOT NULL,
  porcentaje_alerta INTEGER NOT NULL DEFAULT 80,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (family_group_id, categoria_id, mes)
);

CREATE INDEX IF NOT EXISTS idx_presupuestos_grupo_familiar ON presupuestos(family_group_id);

-- Metas de ahorro (se crea junto con deudas porque la cuota liberada de una
-- deuda saldada se reasigna automaticamente a la meta activa).

CREATE TABLE IF NOT EXISTS metas_ahorro (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_group_id INTEGER NOT NULL REFERENCES grupos_familiares(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  nombre TEXT NOT NULL,
  monto_objetivo REAL NOT NULL,
  monto_acumulado REAL NOT NULL DEFAULT 0,
  aporte_mensual REAL NOT NULL DEFAULT 0,
  activa INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_metas_ahorro_grupo_familiar ON metas_ahorro(family_group_id);

-- Configuracion del grupo familiar para el motor de recomendacion de deudas.

CREATE TABLE IF NOT EXISTS configuracion_familia (
  family_group_id INTEGER PRIMARY KEY REFERENCES grupos_familiares(id),
  colchon_emergencia_minimo REAL NOT NULL DEFAULT 0,
  umbral_diferencia_tasas REAL NOT NULL DEFAULT 8
);

-- Fase 4: suscripciones a notificaciones push (Web Push / VAPID).

CREATE TABLE IF NOT EXISTS suscripciones_push (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
