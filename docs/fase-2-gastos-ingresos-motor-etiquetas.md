# Fase 2 — Gastos, ingresos y motor de deteccion de tipo de gasto

## Alcance entregado

- Categorias de gasto e ingreso (CRUD solo Admin, con set inicial sembrado).
- Etiquetas de tipo de gasto configurables por Admin: categorias
  aplicables (opcional), rango de monto min/max, frecuencia minima (N
  repeticiones en M dias) y recurrencia (mismo monto +/- tolerancia% y
  dia aproximado del mes en N meses).
- Motor heuristico (sin IA/LLM) que evalua las etiquetas activas por
  prioridad y sugiere la primera que coincide con un gasto antes de
  guardarlo; el usuario confirma o cambia la etiqueta.
- CRUD de gastos e ingresos con la regla de edicion: un Usuario solo
  edita/borra lo que el mismo registro (403 si intenta tocar lo ajeno);
  el Admin puede editar/borrar cualquier registro.
- Frontend: registro rapido de gasto en el flujo minimo de toques
  (categoria mas usada preseleccionada, fecha de hoy por defecto),
  pantalla de ingresos analoga, y paneles de administracion de
  categorias y etiquetas.

## Archivos creados (backend)

- `src/utilidades/motorEtiquetas.js` — logica heuristica de sugerencia.
- `src/controladores/categorias.controlador.js`,
  `src/controladores/etiquetas.controlador.js`,
  `src/controladores/gastos.controlador.js`,
  `src/controladores/ingresos.controlador.js`
- `src/rutas/categorias.rutas.js`, `src/rutas/etiquetas.rutas.js`,
  `src/rutas/gastos.rutas.js`, `src/rutas/ingresos.rutas.js`

## Archivos modificados (backend)

- `src/bd/esquema.sql` — tablas `categorias`, `etiquetas`,
  `etiquetas_categorias`, `gastos`, `ingresos`.
- `src/bd/index.js` — semilla de categorias iniciales.
- `src/aplicacion.js` — registro de las nuevas rutas.

## Archivos creados (frontend)

- `src/paginas/Gastos.jsx`, `src/paginas/Ingresos.jsx`,
  `src/paginas/CategoriasAdmin.jsx`, `src/paginas/EtiquetasAdmin.jsx`

## Archivos modificados (frontend)

- `src/paginas/Panel.jsx` — accesos rapidos y enlaces de administracion.
- `src/Aplicacion.jsx` — nuevas rutas.

## Endpoints nuevos

| Metodo | Ruta                          | Acceso      |
| ------ | ----------------------------- | ----------- |
| GET    | `/api/categorias`              | Autenticado |
| POST   | `/api/categorias`               | Admin       |
| DELETE | `/api/categorias/:id`           | Admin       |
| GET    | `/api/etiquetas`                | Autenticado |
| POST   | `/api/etiquetas`                | Admin       |
| PATCH  | `/api/etiquetas/:id`            | Admin       |
| DELETE | `/api/etiquetas/:id`            | Admin       |
| GET    | `/api/gastos`                   | Autenticado |
| POST   | `/api/gastos/sugerir-etiqueta`  | Autenticado |
| POST   | `/api/gastos`                   | Autenticado |
| PATCH/DELETE | `/api/gastos/:id`          | Propietario o Admin |
| GET/POST/PATCH/DELETE | `/api/ingresos[/:id]` | Autenticado / Propietario o Admin |
