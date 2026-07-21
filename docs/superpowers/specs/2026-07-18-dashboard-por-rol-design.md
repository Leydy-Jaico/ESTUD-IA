# Diseño: Dashboard "Inicio" por rol

## Contexto

Hoy la ruta índice (`/`) del frontend renderiza siempre `<Reportes/>` (los 10
reportes de negocio), visible solo para ADMINISTRADOR/DOCENTE/DESARROLLADOR
(`Layout.jsx`, arreglo `NAV`). El rol ESTUDIANTE queda excluido de esa ruta y
de casi todo el menú lateral; al iniciar sesión no ve nada relevante. Los
otros tres roles comparten exactamente la misma pantalla sin distinción.

Se pidió agregar "un dashboard para cada rol". Este documento define el
alcance y el diseño técnico antes de implementar.

## Alcance acordado

- Se agrega una pantalla nueva **"Inicio"**, distinta por rol, que pasa a ser
  la nueva ruta índice (`/`).
- **"Reportes" no se toca**: sigue existiendo tal cual, como un ítem más del
  menú, para los roles que ya la tenían (ADMINISTRADOR/DOCENTE/DESARROLLADOR).
- Layout visual: fila de tarjetas KPI (métricas numéricas) arriba + listas de
  detalle abajo (sesiones próximas, tareas pendientes, etc.), reutilizando
  las clases `.placeholder`/`.mock-content` ya usadas en el resto del CSS del
  proyecto (`Reportes.jsx`, `DataTable.jsx`).

## Contenido por rol

| Rol | Tarjetas KPI | Listas de detalle |
|---|---|---|
| ESTUDIANTE | Promedio, % asistencia, estado académico (RF-09) | Próxima sesión, tareas pendientes de entregar, estado de cuotas |
| DOCENTE | N.º de grupos a cargo, entregas por calificar, % asistencia promedio de sus grupos | Grupos a cargo con estado, próximas sesiones |
| DESARROLLADOR | N.º de proyectos Labs asignados, proyectos en desarrollo | Proyectos asignados con estado/fecha límite, comunicaciones de seguimiento relacionadas |
| ADMINISTRADOR | Estudiantes activos, ingresos del mes, matrículas activas, servicios Enterprise activos | Proyectos en desarrollo, comunicaciones abiertas |

Todos los datos salen de las tablas ya existentes (`ESTUDIANTE`, `NOTA`,
`ASISTENCIA`, `SESION`, `GRUPO`, `ENTREGA_TAREA`, `PAGO`, `PROYECTO`,
`INTEGRANTE_PROYECTO`, `COMUNICACION`, `SERVICIO`) usando el mismo pool
`mssql` parametrizado del resto del backend.

## Diseño técnico

### Backend

Nuevo módulo `backend/controllers/dashboard.controller.js` +
`backend/routes/dashboard.routes.js`, montado en `server.js` como
`app.use('/api/dashboard', dashboardRoutes)`.

Cuatro endpoints, cada uno protegido con `verifyToken` + `authorize('ROL')`
del rol correspondiente (mismo patrón que el resto de rutas), y todos
calculan el resumen a partir de `req.user.idUsuario`/`req.user.rol` — **no**
se reutilizan los endpoints de `/api/reportes/*` porque esos devuelven la
tabla completa sin filtrar por usuario:

- `GET /api/dashboard/estudiante` — requiere rol ESTUDIANTE. Reutiliza la
  misma función `calcularEstado` de `academico.controller.js` (promedio +
  estado) y agrega: % asistencia (mismo cálculo que el reporte 2, filtrado a
  `idEstudiante = req.user.idUsuario`), próxima sesión (`SESION` con
  `fecha >= hoy` del grupo del estudiante, `estado = PROGRAMADA`, la más
  cercana), tareas pendientes (`ENTREGA_TAREA` del estudiante con
  `estado <> 'CALIFICADA'`, más tareas de su curso sin fila en
  `ENTREGA_TAREA` — mismo criterio narrativo que el reporte 3 pero acotado a
  su propio `idUsuario`), estado de cuotas (`PAGO` de sus matrículas, tras
  aplicar la misma actualización de morosos de 24h que ya usa
  `pago.controller.js`).
- `GET /api/dashboard/docente` — requiere rol DOCENTE. `GRUPO` con
  `idDocente = req.user.idUsuario`, próximas sesiones de esos grupos,
  entregas pendientes de calificar de los cursos de esos grupos, % de
  asistencia promedio agregando el mismo cálculo del reporte 2 sobre sus
  grupos.
- `GET /api/dashboard/desarrollador` — requiere rol DESARROLLADOR.
  `INTEGRANTE_PROYECTO` + `PROYECTO` de `idUsuario = req.user.idUsuario`,
  comunicaciones `tipoComunicacion = 'SEGUIMIENTO'` de ese usuario.
- `GET /api/dashboard/administrador` — requiere rol ADMINISTRADOR. Cuenta
  estudiantes con matrícula ACTIVA, suma `PAGO.monto` con `estadoPago =
  'PAGADO'` del mes en curso, cuenta matrículas ACTIVAS, cuenta `SERVICIO`
  con `estado = 'ACTIVO'`, cuenta `PROYECTO` con `estado = 'DESARROLLO'`,
  cuenta `COMUNICACION` con `estado IN ('ABIERTO','ASIGNADO')`.

### Frontend

Nueva página `frontend/src/pages/Inicio.jsx`: al montar, lee `usuario.rol`
del `AuthContext`, hace `GET` al endpoint de dashboard correspondiente, y
renderiza una fila de tarjetas KPI (reutilizando el patrón `.placeholder` de
`Reportes.jsx`) + listas de detalle con `DataTable` donde aplique.

Cambios en `App.jsx`: la ruta índice pasa de `<Reportes/>` a `<Inicio/>`.
`Reportes` se monta ahora en la ruta explícita `/reportes`.

Cambios en `Layout.jsx` (`NAV`): se agrega el ítem "Inicio" al principio,
visible para los 4 roles (`roles: ['ADMINISTRADOR','DOCENTE','ESTUDIANTE',
'DESARROLLADOR']`); el ítem "Reportes" existente cambia su `to` de `/` a
`/reportes` pero conserva los mismos roles que tiene hoy.

## Fuera de alcance

- No se modifica el esquema de `tables.sql` (el proyecto documenta
  explícitamente que ese archivo es la fuente de verdad y no se toca).
- No se agregan gráficos/charts — solo números y listas, consistente con el
  resto de la UI actual (tablas simples, sin librería de gráficos instalada).
- No se toca la lógica de negocio existente (verificación de pagos, cálculo
  de estado académico, morosidad a 24h) — el dashboard solo la consulta.
