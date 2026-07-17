# Finanzas del Hogar

Aplicacion web de finanzas del hogar, multiusuario, para uso personal/familiar.
Corre en servidor propio expuesto por Cloudflare Tunnel y es instalable como
PWA en el telefono.

## Estructura del repositorio

- `backend/` — API en Node.js/Express con base de datos SQLite.
- `frontend/` — Aplicacion en React (Vite), instalable como PWA.
- `docs/` — Documentacion del proyecto y resumenes de cada fase de entrega.

## Roles

- **Administrador**: control total (usuarios, categorias, presupuestos,
  deudas, colchon de emergencia, etiquetas y reglas de tipo de gasto).
- **Usuario**: ve toda la informacion familiar, pero solo puede editar o
  borrar lo que el mismo registro.

## Modulos incluidos

- Autenticacion con roles admin/usuario.
- Gastos e ingresos con registro rapido (maximo 3 toques) y defaults
  inteligentes.
- Motor heuristico de deteccion de tipo de gasto (sin IA): etiquetas
  configurables por categoria, rango de monto, frecuencia y recurrencia.
- Deudas: acreedor, saldo, tasa, pago minimo, plazo y fecha fin estimada.
- Presupuestos mensuales por categoria (solo Admin) con alertas push al
  superar el porcentaje configurado.
- Motor de recomendacion de pago de deudas (avalancha / bola de nieve)
  respetando el colchon de emergencia minimo, con reasignacion automatica
  de la cuota liberada a la meta de ahorro activa.
- Metas de ahorro con progreso visual.
- Dashboard de reportes con graficos (por categoria, usuario, etiqueta y
  proyeccion de deudas).
- Sistema de diseno premium (dark navy + dorado, neumorfismo) y PWA
  instalable (manifest + service worker).

## Puesta en marcha (desarrollo)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

La API queda disponible en `http://localhost:4000`. Al iniciar por primera
vez, crea automaticamente el grupo familiar, el usuario administrador
(datos en `.env`: `ADMIN_NOMBRE`, `ADMIN_CORREO`, `ADMIN_CONTRASENA`) y un
set inicial de categorias de gasto e ingreso.

Para las notificaciones push (fase 4) hay que generar un par de claves
VAPID propias (por ejemplo con `npx web-push generate-vapid-keys`) y
colocarlas en `VAPID_CLAVE_PUBLICA` / `VAPID_CLAVE_PRIVADA`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicacion queda disponible en `http://localhost:5173` y redirige las
peticiones `/api` al backend.

## Plan de entrega por fases

1. Autenticacion + roles
2. CRUD de gastos e ingresos + motor de deteccion de tipo de gasto
3. CRUD de deudas + presupuestos
4. Motor de recomendacion de pago de deudas + alertas push
5. Metas de ahorro + reportes
6. Sistema de diseno premium + mobile + PWA

Todas las fases estan completas. Cada una se documenta en `docs/` con el
detalle de los archivos creados o modificados.
