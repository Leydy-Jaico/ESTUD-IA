# Dashboard "Inicio" por rol — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar una pantalla de inicio distinta por rol (ADMINISTRADOR, DOCENTE, ESTUDIANTE, DESARROLLADOR) que reemplace la ruta índice `/`, dejando la página "Reportes" existente intacta como `/reportes`.

**Architecture:** 4 endpoints nuevos en el backend (`GET /api/dashboard/<rol>`), cada uno protegido por `verifyToken`+`authorize(rol)` y calculando un resumen a partir de `req.user.idUsuario`. Una página nueva `Inicio.jsx` en el frontend que lee `usuario.rol` del `AuthContext`, pide el endpoint correspondiente y renderiza tarjetas KPI + listas, reutilizando los estilos ya existentes (`.placeholder`, `.pill`, `DataTable`).

**Tech Stack:** Node.js + Express + `mssql` (backend, patrón ya usado en `reportesConsultas.controller.js`/`academico.controller.js`), React + Vite + `axios` (frontend, patrón ya usado en `Reportes.jsx`).

**Nota sobre verificación:** este proyecto no tiene un framework de tests instalado (no hay `jest`/`vitest`/`mocha` en ningún `package.json`, ni carpeta `tests/`). Por eso cada tarea se verifica igual que el resto del proyecto: levantando el backend real contra `estudia_db` (ya cargada con datos de prueba) y usando `curl` con un token JWT real, comparando contra valores exactos que ya confirmé por SQL directo. No se introduce un framework de tests nuevo — sería alcance no pedido.

**Nota sobre control de versiones:** la carpeta `ESTUD-IA` no es un repositorio git (`git status` confirma "not a git repository"). Los pasos de este plan no incluyen `git commit`; si el usuario quiere versionar el proyecto más adelante, es una decisión aparte.

---

## Task 0: Preparar el entorno para poder probar (contraseñas + backend arriba)

**Files:** ninguno (solo comandos)

- [ ] **Step 1: Hashear las contraseñas de prueba**

Run (desde la carpeta `backend/`):
```bash
cd backend
npm run seed:passwords
```
Expected: imprime `Contraseñas actualizadas para 16 usuario(s).` y lista los 16 correos. Esto deja la contraseña `Estudia2026!` para todos (incluye a Gustavo, Leydy, Mateo, Rodrigo, etc., ya cargados por el `estudia_db.sql` ampliado).

- [ ] **Step 2: Arrancar el backend**

Run:
```bash
npm run dev
```
Expected: `API ESTUD-IA escuchando en el puerto 4001` (el `.env` de este proyecto usa `PORT=4001`) y `Conectado a SQL Server: estudia_db`. Dejar corriendo en esta terminal para las siguientes tareas.

- [ ] **Step 3: Confirmar login y guardar 4 tokens (uno por rol)**

En otra terminal, con el backend corriendo:
```bash
curl -s -X POST http://localhost:4001/api/auth/login -H "Content-Type: application/json" \
  -d '{"correo":"gustavo.garcia@estudia.pe","contrasena":"Estudia2026!"}'
curl -s -X POST http://localhost:4001/api/auth/login -H "Content-Type: application/json" \
  -d '{"correo":"leydy.jaico@estudia.pe","contrasena":"Estudia2026!"}'
curl -s -X POST http://localhost:4001/api/auth/login -H "Content-Type: application/json" \
  -d '{"correo":"mateo.huaman@gmail.com","contrasena":"Estudia2026!"}'
curl -s -X POST http://localhost:4001/api/auth/login -H "Content-Type: application/json" \
  -d '{"correo":"rodrigo.pillaca@estudia.pe","contrasena":"Estudia2026!"}'
```
Expected: cada respuesta trae `{"token":"eyJ...", "usuario": {...,"rol":"ADMINISTRADOR"|"DOCENTE"|"ESTUDIANTE"|"DESARROLLADOR"}}`. Guarda los 4 tokens en variables de shell para las siguientes tareas:
```bash
export TOKEN_ADMIN="<token de gustavo>"
export TOKEN_DOCENTE="<token de leydy>"
export TOKEN_ESTUDIANTE="<token de mateo>"
export TOKEN_DEV="<token de rodrigo>"
```

---

## Task 1: Endpoint `GET /api/dashboard/estudiante`

**Files:**
- Modify: `backend/controllers/academico.controller.js` (exportar `calcularEstado` para reutilizarlo)
- Create: `backend/controllers/dashboard.controller.js`
- Create: `backend/routes/dashboard.routes.js`
- Modify: `backend/server.js` (montar la ruta)

- [ ] **Step 1: Exportar `calcularEstado` desde `academico.controller.js`**

En `backend/controllers/academico.controller.js:81`, la línea actual es:
```js
module.exports = { estadoAcademico, emitirCertificado };
```
Reemplázala por:
```js
module.exports = { estadoAcademico, emitirCertificado, calcularEstado };
```

- [ ] **Step 2: Crear `backend/controllers/dashboard.controller.js`**

```js
const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { calcularEstado } = require('./academico.controller');

const dashboardEstudiante = asyncHandler(async (req, res) => {
  const idUsuario = req.user.idUsuario;
  const pool = await poolPromise;

  const { promedio, estado: estadoAcademico } = await calcularEstado(pool, idUsuario);

  const asistencia = await pool.request().input('id', sql.Int, idUsuario).query(`
    SELECT CAST(
      CASE WHEN COUNT(a.idAsistencia) = 0 THEN 0
           ELSE 100.0 * SUM(CASE WHEN a.estadoAsistencia IN ('PRESENTE', 'TARDANZA') THEN 1 ELSE 0 END) / COUNT(a.idAsistencia)
      END AS DECIMAL(5,2)) AS porcentajeAsistencia
    FROM ESTUDIANTE e
    LEFT JOIN GRUPO g ON g.idGrupo = e.idGrupo
    LEFT JOIN SESION s ON s.idGrupo = g.idGrupo
    LEFT JOIN ASISTENCIA a ON a.idSesion = s.idSesion AND a.idEstudiante = e.idUsuario
    WHERE e.idUsuario = @id
    GROUP BY e.idUsuario`);

  const proximaSesion = await pool.request().input('id', sql.Int, idUsuario).query(`
    SELECT TOP 1 s.fecha, s.horaInicio, g.nombreGrupo
    FROM ESTUDIANTE e
    JOIN GRUPO g ON g.idGrupo = e.idGrupo
    JOIN SESION s ON s.idGrupo = g.idGrupo
    WHERE e.idUsuario = @id AND s.estado = 'PROGRAMADA'
    ORDER BY s.fecha ASC, s.horaInicio ASC`);

  const porCalificar = await pool.request().input('id', sql.Int, idUsuario).query(`
    SELECT t.idTarea, t.titulo, et.fechaEntrega, 'POR_CALIFICAR' AS tipo
    FROM ENTREGA_TAREA et JOIN TAREA t ON t.idTarea = et.idTarea
    WHERE et.idEstudiante = @id AND et.estado <> 'CALIFICADA'`);

  const porEntregar = await pool.request().input('id', sql.Int, idUsuario).query(`
    SELECT t.idTarea, t.titulo, t.fechaEntrega, 'POR_ENTREGAR' AS tipo
    FROM ESTUDIANTE e
    JOIN GRUPO g ON g.idGrupo = e.idGrupo
    JOIN TAREA t ON t.idCurso = g.idCurso AND t.estado = 'ABIERTA'
    WHERE e.idUsuario = @id
      AND NOT EXISTS (SELECT 1 FROM ENTREGA_TAREA et WHERE et.idTarea = t.idTarea AND et.idEstudiante = e.idUsuario)`);

  await pool.request().query(`
    UPDATE PAGO SET estadoPago = 'EN_MORA'
    WHERE estadoPago = 'PENDIENTE' AND fechaPago < DATEADD(HOUR, -24, SYSDATETIME())`);

  const pagos = await pool.request().input('id', sql.Int, idUsuario).query(`
    SELECT pg.idPago, pg.monto, pg.estadoPago, pg.fechaPago
    FROM PAGO pg JOIN MATRICULA m ON m.idMatricula = pg.idMatricula
    WHERE m.idEstudiante = @id
    ORDER BY pg.fechaPago DESC`);

  res.json({
    promedio,
    estadoAcademico,
    porcentajeAsistencia: asistencia.recordset[0]?.porcentajeAsistencia ?? 0,
    proximaSesion: proximaSesion.recordset[0] || null,
    tareasPendientes: [...porCalificar.recordset, ...porEntregar.recordset],
    pagos: pagos.recordset,
    cuotasPendientes: pagos.recordset.filter((p) => p.estadoPago !== 'PAGADO').length
  });
});

module.exports = { dashboardEstudiante };
```

- [ ] **Step 3: Crear `backend/routes/dashboard.routes.js`**

```js
const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { dashboardEstudiante } = require('../controllers/dashboard.controller');

router.get('/estudiante', verifyToken, authorize('ESTUDIANTE'), dashboardEstudiante);

module.exports = router;
```

- [ ] **Step 4: Montar la ruta en `backend/server.js`**

Después de la línea `const academicoRoutes = require('./routes/academico.routes');` (línea 29), agrega:
```js
const dashboardRoutes = require('./routes/dashboard.routes');
```
Después de la línea `app.use('/api/academico', academicoRoutes);` (línea 60), agrega:
```js
app.use('/api/dashboard', dashboardRoutes);
```

- [ ] **Step 5: Reiniciar el backend y probar con curl**

`nodemon` recarga solo. Con `$TOKEN_ESTUDIANTE` de la Task 0 (Mateo, idUsuario=3):
```bash
curl -s http://localhost:4001/api/dashboard/estudiante -H "Authorization: Bearer $TOKEN_ESTUDIANTE"
```
Expected (valores exactos verificados por SQL directo sobre los datos ya cargados):
```json
{
  "promedio": 17.17,
  "estadoAcademico": "APROBADO",
  "porcentajeAsistencia": 100.00,
  "proximaSesion": {"fecha":"2026-04-26T00:00:00.000Z","horaInicio":"09:00:00","nombreGrupo":"IA-9-11-A"},
  "tareasPendientes": [{"idTarea":2,"titulo":"Ensayo: impacto de la IA en la educación","fechaEntrega":null,"tipo":"POR_CALIFICAR"}],
  "pagos": [{"idPago":2,"monto":125,"estadoPago":"PAGADO", "...":"..."},{"idPago":1,"monto":125,"estadoPago":"PAGADO","...":"..."}],
  "cuotasPendientes": 0
}
```
(Los campos de fecha exactos dependen del driver `mssql`/zona horaria; lo que importa es que `promedio=17.17`, `estadoAcademico="APROBADO"`, `porcentajeAsistencia=100`, `cuotasPendientes=0`, y que aparezcan exactamente 1 tarea pendiente y 2 pagos.)

- [ ] **Step 6: Probar el caso de un rol distinto (debe dar 403)**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4001/api/dashboard/estudiante -H "Authorization: Bearer $TOKEN_ADMIN"
```
Expected: `403` (Gustavo es ADMINISTRADOR, no ESTUDIANTE — `authorize('ESTUDIANTE')` debe rechazarlo).

---

## Task 2: Endpoint `GET /api/dashboard/docente`

**Files:**
- Modify: `backend/controllers/dashboard.controller.js`
- Modify: `backend/routes/dashboard.routes.js`

- [ ] **Step 1: Agregar `dashboardDocente` a `backend/controllers/dashboard.controller.js`**

Antes de la línea `module.exports = { dashboardEstudiante };`, agrega:
```js
const dashboardDocente = asyncHandler(async (req, res) => {
  const idDocente = req.user.idUsuario;
  const pool = await poolPromise;

  const grupos = await pool.request().input('id', sql.Int, idDocente).query(`
    SELECT g.idGrupo, g.nombreGrupo, g.estado, c.nombreCurso
    FROM GRUPO g JOIN CURSO c ON c.idCurso = g.idCurso
    WHERE g.idDocente = @id
    ORDER BY g.nombreGrupo`);

  const proximasSesiones = await pool.request().input('id', sql.Int, idDocente).query(`
    SELECT TOP 5 s.idSesion, s.fecha, s.horaInicio, g.nombreGrupo
    FROM SESION s JOIN GRUPO g ON g.idGrupo = s.idGrupo
    WHERE g.idDocente = @id AND s.estado = 'PROGRAMADA'
    ORDER BY s.fecha ASC, s.horaInicio ASC`);

  const entregasPendientes = await pool.request().input('id', sql.Int, idDocente).query(`
    SELECT et.idEntrega, t.titulo, u.nombres, u.apellidos, et.fechaEntrega, et.estado
    FROM ENTREGA_TAREA et
    JOIN TAREA t ON t.idTarea = et.idTarea
    JOIN USUARIO u ON u.idUsuario = et.idEstudiante
    WHERE et.estado <> 'CALIFICADA'
      AND t.idCurso IN (SELECT idCurso FROM GRUPO WHERE idDocente = @id)
    ORDER BY et.fechaEntrega`);

  const asistencia = await pool.request().input('id', sql.Int, idDocente).query(`
    SELECT CAST(
      CASE WHEN COUNT(a.idAsistencia) = 0 THEN 0
           ELSE 100.0 * SUM(CASE WHEN a.estadoAsistencia IN ('PRESENTE', 'TARDANZA') THEN 1 ELSE 0 END) / COUNT(a.idAsistencia)
      END AS DECIMAL(5,2)) AS porcentajeAsistenciaPromedio
    FROM GRUPO g
    JOIN SESION s ON s.idGrupo = g.idGrupo
    JOIN ASISTENCIA a ON a.idSesion = s.idSesion
    WHERE g.idDocente = @id`);

  res.json({
    grupos: grupos.recordset,
    proximasSesiones: proximasSesiones.recordset,
    entregasPendientes: entregasPendientes.recordset,
    porcentajeAsistenciaPromedio: asistencia.recordset[0]?.porcentajeAsistenciaPromedio ?? 0
  });
});
```
Y cambia la última línea del archivo a:
```js
module.exports = { dashboardEstudiante, dashboardDocente };
```

- [ ] **Step 2: Agregar la ruta en `backend/routes/dashboard.routes.js`**

```js
const { dashboardEstudiante, dashboardDocente } = require('../controllers/dashboard.controller');
```
(reemplaza el `require` de la Task 1) y agrega debajo de la ruta de `/estudiante`:
```js
router.get('/docente', verifyToken, authorize('DOCENTE'), dashboardDocente);
```

- [ ] **Step 3: Probar con curl (Leydy, idUsuario=2)**

```bash
curl -s http://localhost:4001/api/dashboard/docente -H "Authorization: Bearer $TOKEN_DOCENTE"
```
Expected: `grupos` con 2 elementos (`IA-9-11-A` EN_CURSO, `PY-12-14-A` PROGRAMADO), `proximasSesiones` con 3 elementos (04-06, 04-13, 04-26 en ese orden), `entregasPendientes` con exactamente 1 elemento (Mateo, tarea "Ensayo: impacto de la IA en la educación"), `porcentajeAsistenciaPromedio: 66.67`.

---

## Task 3: Endpoint `GET /api/dashboard/desarrollador`

**Files:**
- Modify: `backend/controllers/dashboard.controller.js`
- Modify: `backend/routes/dashboard.routes.js`

- [ ] **Step 1: Agregar `dashboardDesarrollador` a `backend/controllers/dashboard.controller.js`**

```js
const dashboardDesarrollador = asyncHandler(async (req, res) => {
  const idUsuario = req.user.idUsuario;
  const pool = await poolPromise;

  const proyectos = await pool.request().input('id', sql.Int, idUsuario).query(`
    SELECT p.idProyecto, p.nombreProyecto, p.estado, p.fechaLimite, i.rolProyecto
    FROM INTEGRANTE_PROYECTO i JOIN PROYECTO p ON p.idProyecto = i.idProyecto
    WHERE i.idUsuario = @id
    ORDER BY p.fechaLimite`);

  const seguimiento = await pool.request().input('id', sql.Int, idUsuario).query(`
    SELECT idComunicacion, asunto, detalle, estado, fecha
    FROM COMUNICACION
    WHERE idUsuario = @id AND tipoComunicacion = 'SEGUIMIENTO'
    ORDER BY fecha DESC`);

  res.json({
    proyectos: proyectos.recordset,
    proyectosEnDesarrollo: proyectos.recordset.filter((p) => p.estado === 'DESARROLLO').length,
    comunicacionesSeguimiento: seguimiento.recordset
  });
});
```
Cambia el `module.exports` a:
```js
module.exports = { dashboardEstudiante, dashboardDocente, dashboardDesarrollador };
```

- [ ] **Step 2: Agregar la ruta**

En `backend/routes/dashboard.routes.js`, actualiza el `require` y agrega:
```js
router.get('/desarrollador', verifyToken, authorize('DESARROLLADOR'), dashboardDesarrollador);
```

- [ ] **Step 3: Probar con curl (Rodrigo, idUsuario=5)**

```bash
curl -s http://localhost:4001/api/dashboard/desarrollador -H "Authorization: Bearer $TOKEN_DEV"
```
Expected: `proyectos` con 4 elementos (`Detector de plagio académico con IA` DESARROLLO, `App de gamificación...` DISENO, `Sistema de reconocimiento de emociones...` PRUEBAS, `Recomendador de rutas...` FINALIZADO), `proyectosEnDesarrollo: 1`, `comunicacionesSeguimiento: []` (Rodrigo no tiene comunicaciones de seguimiento en los datos de prueba — es un caso válido de lista vacía, no un error).

---

## Task 4: Endpoint `GET /api/dashboard/administrador`

**Files:**
- Modify: `backend/controllers/dashboard.controller.js`
- Modify: `backend/routes/dashboard.routes.js`

- [ ] **Step 1: Agregar `dashboardAdministrador` a `backend/controllers/dashboard.controller.js`**

```js
const dashboardAdministrador = asyncHandler(async (req, res) => {
  const pool = await poolPromise;

  const estudiantesActivos = await pool.request().query(`
    SELECT COUNT(DISTINCT idEstudiante) AS total FROM MATRICULA WHERE estadoMatricula = 'ACTIVA'`);

  const ingresosMes = await pool.request().query(`
    SELECT ISNULL(SUM(monto), 0) AS total FROM PAGO
    WHERE estadoPago = 'PAGADO' AND MONTH(fechaPago) = MONTH(SYSDATETIME()) AND YEAR(fechaPago) = YEAR(SYSDATETIME())`);

  const matriculasActivas = await pool.request().query(`
    SELECT COUNT(*) AS total FROM MATRICULA WHERE estadoMatricula = 'ACTIVA'`);

  const serviciosActivos = await pool.request().query(`
    SELECT COUNT(*) AS total FROM SERVICIO WHERE estado = 'ACTIVO'`);

  const proyectosEnDesarrollo = await pool.request().query(`
    SELECT idProyecto, nombreProyecto, fechaLimite FROM PROYECTO WHERE estado = 'DESARROLLO'`);

  const comunicacionesAbiertas = await pool.request().query(`
    SELECT COUNT(*) AS total FROM COMUNICACION WHERE estado IN ('ABIERTO', 'ASIGNADO')`);

  res.json({
    estudiantesActivos: estudiantesActivos.recordset[0].total,
    ingresosMes: ingresosMes.recordset[0].total,
    matriculasActivas: matriculasActivas.recordset[0].total,
    serviciosActivos: serviciosActivos.recordset[0].total,
    proyectosEnDesarrollo: proyectosEnDesarrollo.recordset,
    comunicacionesAbiertas: comunicacionesAbiertas.recordset[0].total
  });
});
```
Cambia el `module.exports` a:
```js
module.exports = { dashboardEstudiante, dashboardDocente, dashboardDesarrollador, dashboardAdministrador };
```

- [ ] **Step 2: Agregar la ruta**

En `backend/routes/dashboard.routes.js`, actualiza el `require` y agrega:
```js
router.get('/administrador', verifyToken, authorize('ADMINISTRADOR'), dashboardAdministrador);
```

- [ ] **Step 3: Probar con curl (Gustavo, idUsuario=1)**

```bash
curl -s http://localhost:4001/api/dashboard/administrador -H "Authorization: Bearer $TOKEN_ADMIN"
```
Expected: `estudiantesActivos: 9` (Yamile no cuenta: su matrícula está FINALIZADA, no ACTIVA), `matriculasActivas: 9`, `serviciosActivos: 2`, `proyectosEnDesarrollo` con 2 elementos, `comunicacionesAbiertas: 7`, `ingresosMes: 19085` (puede variar levemente si vuelves a cargar `estudia_db.sql` en un mes distinto, porque casi todos los pagos usan `DEFAULT` = fecha de inserción).

---

## Task 5: Página `Inicio.jsx` en el frontend

**Files:**
- Create: `frontend/src/pages/Inicio.jsx`

- [ ] **Step 1: Crear el archivo**

```jsx
import { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';

function Kpi({ valor, etiqueta }) {
  return (
    <div className="placeholder" style={{ padding: 14, textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{valor}</div>
      <div className="label">{etiqueta}</div>
    </div>
  );
}

function KpiRow({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${children.length}, 1fr)`, gap: 10, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function InicioEstudiante({ data }) {
  return (
    <div>
      <KpiRow>
        <Kpi valor={data.promedio ?? '—'} etiqueta="Promedio" />
        <Kpi valor={`${data.porcentajeAsistencia}%`} etiqueta="Asistencia" />
        <Kpi valor={data.estadoAcademico} etiqueta="Estado académico" />
      </KpiRow>
      <div className="section">
        <h2>Próxima sesión</h2>
        {data.proximaSesion
          ? <p>{new Date(data.proximaSesion.fecha).toLocaleDateString()} {data.proximaSesion.horaInicio} — {data.proximaSesion.nombreGrupo}</p>
          : <p>No tienes sesiones programadas.</p>}
      </div>
      <div className="section">
        <h2>Tareas pendientes ({data.tareasPendientes.length})</h2>
        <DataTable
          columns={[
            { key: 'titulo', label: 'Tarea' },
            { key: 'tipo', label: 'Estado', render: (r) => r.tipo === 'POR_CALIFICAR' ? 'Entregada, por calificar' : 'Por entregar' }
          ]}
          rows={data.tareasPendientes}
        />
      </div>
      <div className="section">
        <h2>Cuotas ({data.cuotasPendientes} pendiente{data.cuotasPendientes === 1 ? '' : 's'})</h2>
        <DataTable
          columns={[
            { key: 'monto', label: 'Monto', render: (r) => `S/ ${Number(r.monto).toFixed(2)}` },
            { key: 'estadoPago', label: 'Estado' }
          ]}
          rows={data.pagos}
        />
      </div>
    </div>
  );
}

function InicioDocente({ data }) {
  return (
    <div>
      <KpiRow>
        <Kpi valor={data.grupos.length} etiqueta="Grupos a cargo" />
        <Kpi valor={data.entregasPendientes.length} etiqueta="Entregas por calificar" />
        <Kpi valor={`${data.porcentajeAsistenciaPromedio}%`} etiqueta="Asistencia promedio" />
      </KpiRow>
      <div className="section">
        <h2>Grupos a cargo</h2>
        <DataTable
          columns={[
            { key: 'nombreGrupo', label: 'Grupo' },
            { key: 'nombreCurso', label: 'Curso' },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={data.grupos}
        />
      </div>
      <div className="section">
        <h2>Próximas sesiones</h2>
        <DataTable
          columns={[
            { key: 'nombreGrupo', label: 'Grupo' },
            { key: 'fecha', label: 'Fecha', render: (r) => new Date(r.fecha).toLocaleDateString() },
            { key: 'horaInicio', label: 'Hora' }
          ]}
          rows={data.proximasSesiones}
        />
      </div>
      <div className="section">
        <h2>Entregas pendientes de calificar</h2>
        <DataTable
          columns={[
            { key: 'titulo', label: 'Tarea' },
            { key: 'nombres', label: 'Estudiante', render: (r) => `${r.nombres} ${r.apellidos}` },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={data.entregasPendientes}
        />
      </div>
    </div>
  );
}

function InicioDesarrollador({ data }) {
  return (
    <div>
      <KpiRow>
        <Kpi valor={data.proyectos.length} etiqueta="Proyectos asignados" />
        <Kpi valor={data.proyectosEnDesarrollo} etiqueta="En desarrollo" />
      </KpiRow>
      <div className="section">
        <h2>Mis proyectos</h2>
        <DataTable
          columns={[
            { key: 'nombreProyecto', label: 'Proyecto' },
            { key: 'estado', label: 'Estado' },
            { key: 'fechaLimite', label: 'Fecha límite', render: (r) => String(r.fechaLimite).slice(0, 10) },
            { key: 'rolProyecto', label: 'Mi rol' }
          ]}
          rows={data.proyectos}
        />
      </div>
      <div className="section">
        <h2>Seguimiento</h2>
        <DataTable
          columns={[
            { key: 'asunto', label: 'Asunto' },
            { key: 'estado', label: 'Estado' }
          ]}
          rows={data.comunicacionesSeguimiento}
        />
      </div>
    </div>
  );
}

function InicioAdministrador({ data }) {
  return (
    <div>
      <KpiRow>
        <Kpi valor={data.estudiantesActivos} etiqueta="Estudiantes activos" />
        <Kpi valor={`S/ ${Number(data.ingresosMes).toFixed(2)}`} etiqueta="Ingresos del mes" />
        <Kpi valor={data.matriculasActivas} etiqueta="Matrículas activas" />
        <Kpi valor={data.serviciosActivos} etiqueta="Servicios Enterprise activos" />
      </KpiRow>
      <div className="section">
        <h2>Proyectos Labs en desarrollo</h2>
        <DataTable
          columns={[
            { key: 'nombreProyecto', label: 'Proyecto' },
            { key: 'fechaLimite', label: 'Fecha límite', render: (r) => String(r.fechaLimite).slice(0, 10) }
          ]}
          rows={data.proyectosEnDesarrollo}
        />
      </div>
      <div className="section">
        <p><span className="pill pill-blue">{data.comunicacionesAbiertas} comunicaciones abiertas o asignadas</span></p>
      </div>
    </div>
  );
}

const ENDPOINT_POR_ROL = {
  ESTUDIANTE: '/dashboard/estudiante',
  DOCENTE: '/dashboard/docente',
  DESARROLLADOR: '/dashboard/desarrollador',
  ADMINISTRADOR: '/dashboard/administrador'
};

const VISTA_POR_ROL = {
  ESTUDIANTE: InicioEstudiante,
  DOCENTE: InicioDocente,
  DESARROLLADOR: InicioDesarrollador,
  ADMINISTRADOR: InicioAdministrador
};

export default function Inicio() {
  const { usuario } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = ENDPOINT_POR_ROL[usuario?.rol];
    if (!endpoint) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await api.get(endpoint);
      setData(data);
      setLoading(false);
    })();
  }, [usuario?.rol]);

  if (loading) return <p>Cargando...</p>;

  const Vista = VISTA_POR_ROL[usuario?.rol];
  if (!Vista || !data) return <p>No hay un inicio configurado para tu rol.</p>;

  return (
    <div>
      <h1>Hola, {usuario.nombres}</h1>
      <Vista data={data} />
    </div>
  );
}
```

- [ ] **Step 2: Verificación visual queda para la Task 7 (end-to-end en navegador)**, ya que necesita `App.jsx`/`Layout.jsx` actualizados primero para poder navegar a `/`.

---

## Task 6: Enrutamiento — `App.jsx` y `Layout.jsx`

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/Layout.jsx`

- [ ] **Step 1: Actualizar `App.jsx`**

Agrega el import (junto a los demás imports de páginas, `frontend/src/App.jsx:6`):
```jsx
import Inicio from './pages/Inicio';
```
Cambia la ruta índice (`frontend/src/App.jsx:39`) de:
```jsx
            <Route index element={<Reportes />} />
```
a:
```jsx
            <Route index element={<Inicio />} />
            <Route path="reportes" element={<Reportes />} />
```

- [ ] **Step 2: Actualizar `Layout.jsx`**

En `frontend/src/components/Layout.jsx`, agrega el ícono `FiHome` al import de `react-icons/fi` (línea 2-6):
```jsx
import {
  FiHome, FiBarChart2, FiUsers, FiBookOpen, FiLayers, FiCalendar, FiClipboard,
  FiFileText, FiDollarSign, FiAward, FiCpu, FiBriefcase, FiFileMinus,
  FiPackage, FiFilePlus, FiMessageCircle, FiBell, FiMail, FiLogOut
} from 'react-icons/fi';
```
Reemplaza la primera entrada del arreglo `NAV` (línea 10):
```jsx
  { to: '/', label: 'Reportes', icon: FiBarChart2, roles: ['ADMINISTRADOR', 'DOCENTE', 'DESARROLLADOR'] },
```
por dos entradas:
```jsx
  { to: '/', label: 'Inicio', icon: FiHome, roles: ['ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE', 'DESARROLLADOR'] },
  { to: '/reportes', label: 'Reportes', icon: FiBarChart2, roles: ['ADMINISTRADOR', 'DOCENTE', 'DESARROLLADOR'] },
```

- [ ] **Step 3: Confirmar que no quedó ninguna referencia rota**

Run:
```bash
grep -rn "roles: \[\]" frontend/src/components/Layout.jsx
```
Expected: sin resultados (todas las entradas de `NAV` siguen teniendo su arreglo de roles).

---

## Task 7: Verificación end-to-end en navegador (los 4 roles)

**Files:** ninguno (solo verificación manual)

- [ ] **Step 1: Arrancar el frontend**

```bash
cd frontend
npm run dev
```
Expected: `Local: http://localhost:5173/`.

- [ ] **Step 2: Entrar como ESTUDIANTE (Mateo)**

Abrir `http://localhost:5173`, iniciar sesión con `mateo.huaman@gmail.com` / `Estudia2026!`.
Expected: el menú lateral ahora muestra "Inicio" y "Notificaciones" (antes solo mostraba "Notificaciones"); la pantalla de Inicio muestra promedio 17.17, asistencia 100%, estado APROBADO, 1 tarea pendiente, 0 cuotas pendientes.

- [ ] **Step 3: Entrar como DOCENTE (Leydy)**

`leydy.jaico@estudia.pe` / `Estudia2026!`.
Expected: Inicio muestra 2 grupos a cargo, 3 próximas sesiones, 1 entrega pendiente de calificar, 66.67% de asistencia promedio. El ítem "Reportes" sigue en el menú y sigue funcionando igual que antes.

- [ ] **Step 4: Entrar como DESARROLLADOR (Rodrigo)**

`rodrigo.pillaca@estudia.pe` / `Estudia2026!`.
Expected: Inicio muestra 4 proyectos asignados, 1 en desarrollo, tabla de seguimiento vacía (sin error, solo "Sin registros" del `DataTable`).

- [ ] **Step 5: Entrar como ADMINISTRADOR (Gustavo)**

`gustavo.garcia@estudia.pe` / `Estudia2026!`.
Expected: Inicio muestra 9 estudiantes activos, ingresos del mes ~S/ 19085.00, 9 matrículas activas, 2 servicios activos, 2 proyectos en desarrollo, "7 comunicaciones abiertas o asignadas". El ítem "Reportes" sigue disponible con los 10 reportes de siempre, sin cambios.

- [ ] **Step 6: Revisar la consola del navegador en las 4 sesiones**

Expected: sin errores en rojo (`read_console_messages` si se verifica con el Browser pane, o la consola de DevTools manualmente).

---

## Self-review de este plan

- **Cobertura del spec:** los 4 roles del spec tienen su endpoint (Tasks 1-4) y su vista (Task 5); el enrutamiento (Task 6) cumple "Reportes no se toca, solo baja de ruta"; Task 7 verifica los 4 roles de punta a punta. Sin huecos.
- **Sin placeholders:** cada paso tiene código completo y comandos con salida esperada concreta (no hay "TODO" ni "manejar errores apropiadamente").
- **Consistencia de tipos:** los nombres de campo (`porcentajeAsistencia`, `estadoAcademico`, `tareasPendientes`, `cuotasPendientes`, `proyectosEnDesarrollo`, `comunicacionesAbiertas`, etc.) son los mismos entre el controller que los genera y el `Inicio.jsx` que los consume.
