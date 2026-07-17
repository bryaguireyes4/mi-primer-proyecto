# Fase 3 — Deudas y presupuestos

## Alcance entregado

- CRUD de deudas: acreedor, monto total, saldo restante, tasa de interes,
  pago minimo mensual, dia de pago, plazo en meses y fecha fin estimada
  (calculada automaticamente). Misma regla de edicion que gastos/ingresos.
- Al saldar una deuda (saldo restante = 0) se marca como inactiva y su
  cuota liberada se reasigna automaticamente a la meta de ahorro activa
  (ver fase 5) sumandola a `aporte_mensual`.
- Presupuestos mensuales por categoria de gasto, configurables solo por
  Admin, con porcentaje de alerta configurable y calculo del gasto
  acumulado del mes.

## Archivos creados (backend)

- `src/controladores/deudas.controlador.js`,
  `src/controladores/presupuestos.controlador.js`
- `src/rutas/deudas.rutas.js`, `src/rutas/presupuestos.rutas.js`

## Archivos modificados (backend)

- `src/bd/esquema.sql` — tablas `deudas`, `presupuestos`, y se adelantan
  `metas_ahorro` y `configuracion_familia` (las necesita la reasignacion
  de cuota liberada y el motor de recomendacion de la fase 4).
- `src/bd/index.js` — semilla de `configuracion_familia` por defecto.
- `src/aplicacion.js` — registro de las nuevas rutas.

## Archivos creados (frontend)

- `src/paginas/Deudas.jsx`, `src/paginas/PresupuestosAdmin.jsx`

## Archivos modificados (frontend)

- `src/paginas/Panel.jsx`, `src/Aplicacion.jsx`

## Endpoints nuevos

| Metodo | Ruta                    | Acceso               |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/deudas`            | Autenticado           |
| POST   | `/api/deudas`            | Autenticado           |
| PATCH/DELETE | `/api/deudas/:id`  | Propietario o Admin   |
| GET    | `/api/presupuestos`      | Autenticado           |
| POST/PATCH/DELETE | `/api/presupuestos[/:id]` | Admin |
