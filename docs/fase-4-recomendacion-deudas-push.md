# Fase 4 — Motor de recomendacion de deudas y alertas push

## Alcance entregado

- Configuracion financiera del grupo familiar (colchon de emergencia
  minimo y umbral de diferencia de tasas), editable solo por Admin.
- Motor de recomendacion mensual:
  `disponible = ingresos del mes - gastos del mes - suma de pagos minimos
  de deudas activas`. Si el excedente (disponible - colchon minimo) no es
  positivo, no se recomienda pago extra ese mes.
  Si hay excedente, se compara la diferencia entre la tasa mas alta y la
  mas baja de las deudas activas contra el umbral configurado (por
  defecto 8 puntos porcentuales): si la iguala o supera, se recomienda
  **avalancha** (abonar de mas a la deuda con mayor tasa); si es menor,
  **bola de nieve** (abonar de mas a la de menor saldo).
- Notificaciones push (Web Push + VAPID): al registrar un gasto que hace
  superar el porcentaje de alerta de un presupuesto, se envia una
  notificacion a todos los dispositivos suscritos del grupo familiar.
- Service worker (`public/sw.js`) con manejo de `push` y
  `notificationclick`, mas utilidades en el frontend para solicitar
  permiso y suscribirse.

## Archivos creados (backend)

- `src/utilidades/motorRecomendacionDeudas.js`
- `src/utilidades/notificacionesPush.js`
- `src/controladores/configuracion.controlador.js`,
  `src/controladores/notificaciones.controlador.js`
- `src/rutas/configuracion.rutas.js`, `src/rutas/notificaciones.rutas.js`

## Archivos modificados (backend)

- `src/bd/esquema.sql` — tabla `suscripciones_push`.
- `src/controladores/deudas.controlador.js` — endpoint de recomendacion.
- `src/controladores/gastos.controlador.js` — disparo de alerta de
  presupuesto al crear un gasto.
- `src/aplicacion.js`, `.env.example` (claves VAPID), `package.json`
  (dependencia `web-push`).

## Archivos creados (frontend)

- `public/sw.js` — service worker.
- `src/utilidades/push.js` — registro y suscripcion push.
- `src/paginas/ConfiguracionAdmin.jsx`

## Archivos modificados (frontend)

- `src/paginas/Deudas.jsx` — tarjeta de recomendacion mensual.
- `src/paginas/Panel.jsx`, `src/Aplicacion.jsx`

## Endpoints nuevos

| Metodo | Ruta                              | Acceso      |
| ------ | ---------------------------------- | ----------- |
| GET    | `/api/configuracion`                | Autenticado |
| PATCH  | `/api/configuracion`                | Admin       |
| GET    | `/api/deudas/recomendacion`         | Autenticado |
| GET    | `/api/notificaciones/clave-publica` | Publico     |
| POST   | `/api/notificaciones/suscribir`     | Autenticado |
| POST   | `/api/notificaciones/desuscribir`   | Autenticado |

**Nota:** las notificaciones push requieren generar un par de claves
VAPID propias y configurarlas en `.env` (`VAPID_CLAVE_PUBLICA` /
`VAPID_CLAVE_PRIVADA`); sin ellas el envio se omite de forma segura.
