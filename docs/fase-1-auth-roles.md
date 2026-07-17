# Fase 1 — Autenticacion y roles

## Alcance entregado

- Modelo de datos con `grupos_familiares` y `usuarios` (preparado para
  multi-tenant mediante `family_group_id`, aunque v1 solo usa un grupo).
- Autenticacion con JWT: inicio de sesion con correo y contrasena.
- Dos roles: `admin` y `usuario`.
- El administrador puede crear usuarios, editarlos y desactivarlos (no se
  permite el borrado fisico ni la autodesactivacion).
- Semilla automatica del primer administrador a partir de variables de
  entorno cuando la base de datos esta vacia.
- Frontend con pantalla de inicio de sesion, panel principal y pantalla de
  gestion de usuarios (solo visible para administradores), con rutas
  protegidas segun sesion y rol.
- Tokens de diseno base (paleta dark navy + dorado) para que las siguientes
  fases reutilicen la misma paleta y sistema de espaciado.

## Archivos creados

### Backend (`backend/`)

- `package.json`, `.env.example`, `.gitignore`
- `src/configuracion/entorno.js` — lectura de variables de entorno.
- `src/bd/index.js` — conexion SQLite, ejecucion del esquema y semilla del
  administrador inicial.
- `src/bd/esquema.sql` — tablas `grupos_familiares` y `usuarios`.
- `src/utilidades/errores.js` — clase `ErrorAplicacion` para errores con
  codigo HTTP.
- `src/intermedios/autenticacion.js` — middlewares `autenticar` y
  `requerirAdmin`.
- `src/controladores/autenticacion.controlador.js` — inicio de sesion y
  perfil del usuario autenticado.
- `src/controladores/usuarios.controlador.js` — listar, crear y actualizar
  usuarios (con reglas de negocio: no autodesactivarse, no quitarse el rol
  de admin, correos unicos).
- `src/rutas/autenticacion.rutas.js`, `src/rutas/usuarios.rutas.js`
- `src/aplicacion.js` — configuracion de Express y manejo central de
  errores (mensajes en espanol, sin exponer codigos HTTP crudos al
  usuario final).
- `src/servidor.js` — punto de entrada.

### Frontend (`frontend/`)

- Proyecto Vite + React generado y limpiado del contenido de plantilla.
- `src/estilos/variables.css` — tokens de diseno (color, radio, espaciado,
  tamano minimo de toque).
- `src/componentes/interfaz.css` — estilos base reutilizables (tarjeta,
  boton, campo, insignia, etc.).
- `src/api/cliente.js` — instancia de Axios con envio automatico del token.
- `src/contexto/ContextoAutenticacion.jsx` — estado global de sesion.
- `src/componentes/RutaProtegida.jsx` — proteccion de rutas por sesion y
  rol.
- `src/paginas/IniciarSesion.jsx`, `src/paginas/Panel.jsx`,
  `src/paginas/UsuariosAdmin.jsx`
- `src/Aplicacion.jsx`, `src/principal.jsx`, `index.html` (ajustados).

## Endpoints de la API

| Metodo | Ruta                              | Acceso        | Descripcion                         |
| ------ | --------------------------------- | ------------- | ------------------------------------ |
| POST   | `/api/autenticacion/iniciar-sesion` | Publico       | Inicia sesion y devuelve el token.  |
| GET    | `/api/autenticacion/perfil`        | Autenticado   | Devuelve el usuario de la sesion.   |
| GET    | `/api/usuarios`                    | Admin         | Lista los usuarios del grupo familiar. |
| POST   | `/api/usuarios`                    | Admin         | Crea un usuario.                    |
| PATCH  | `/api/usuarios/:id`                | Admin         | Edita o desactiva/reactiva un usuario. |

## Pendiente para fases siguientes

- CRUD de gastos e ingresos y motor de deteccion de tipo de gasto (fase 2).
- El resto de modulos (deudas, presupuestos, metas, reportes, push, PWA)
  segun el plan de fases del README.
