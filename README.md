# Finanzas del Hogar

Aplicacion web de finanzas del hogar, multiusuario, para uso personal/familiar.
Corre en servidor propio expuesto por Cloudflare Tunnel y es instalable como
PWA en el telefono.

## Estructura del repositorio

- `backend/` — API en Node.js/Express con base de datos SQLite.
- `frontend/` — Aplicacion en React (Vite).
- `docs/` — Documentacion del proyecto y resumenes de cada fase de entrega.

## Roles

- **Administrador**: control total (usuarios, categorias, presupuestos,
  deudas, colchon de emergencia, etiquetas y reglas de tipo de gasto).
- **Usuario**: ve toda la informacion familiar, pero solo puede editar o
  borrar lo que el mismo registro.

## Puesta en marcha (desarrollo)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

La API queda disponible en `http://localhost:4000`. Al iniciar por primera
vez, crea automaticamente el grupo familiar y el usuario administrador con
los datos definidos en `.env` (`ADMIN_NOMBRE`, `ADMIN_CORREO`,
`ADMIN_CONTRASENA`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicacion queda disponible en `http://localhost:5173` y redirige las
peticiones `/api` al backend.

## Plan de entrega por fases

1. Autenticacion + roles (completada)
2. CRUD de gastos e ingresos + motor de deteccion de tipo de gasto
3. CRUD de deudas + presupuestos
4. Motor de recomendacion de pago de deudas + alertas push
5. Metas de ahorro + reportes
6. Sistema de diseno premium + mobile + PWA

Cada fase se documenta en `docs/` con el detalle de los archivos creados o
modificados.
