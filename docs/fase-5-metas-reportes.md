# Fase 5 — Metas de ahorro y reportes

## Alcance entregado

- CRUD de metas de ahorro (nombre, monto objetivo, monto acumulado,
  aporte mensual), con la misma regla de edicion propia/Admin. El aporte
  mensual se incrementa automaticamente cuando se salda una deuda (fase 3).
- Barra de progreso visual por meta.
- Dashboard de reportes con filtro de periodo (desde/hasta) y graficos de
  barras: gastos por categoria, ingresos por categoria, gastos por
  usuario y gastos por etiqueta de tipo de gasto. Incluye tambien el
  listado de deudas activas y la proyeccion del motor de recomendacion.

## Archivos creados (backend)

- `src/controladores/metas.controlador.js`,
  `src/controladores/reportes.controlador.js`
- `src/rutas/metas.rutas.js`, `src/rutas/reportes.rutas.js`

## Archivos modificados (backend)

- `src/aplicacion.js` — registro de las nuevas rutas.
  (La tabla `metas_ahorro` ya existia desde la fase 3.)

## Archivos creados (frontend)

- `src/paginas/Metas.jsx`, `src/paginas/Reportes.jsx`
- Dependencia nueva: `recharts` (graficos de barras).

## Archivos modificados (frontend)

- `src/paginas/Panel.jsx`, `src/Aplicacion.jsx`

## Endpoints nuevos

| Metodo | Ruta                    | Acceso               |
| ------ | ------------------------ | -------------------- |
| GET    | `/api/metas`              | Autenticado           |
| POST   | `/api/metas`              | Autenticado           |
| PATCH/DELETE | `/api/metas/:id`     | Propietario o Admin   |
| GET    | `/api/reportes/resumen`   | Autenticado           |
