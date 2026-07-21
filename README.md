# ESTUD-IA — Sistema de Información Web

Sistema de gestión para ESTUD-IA (Academy, Labs y Enterprise): control de
matrícula, asistencia, tareas y calificaciones, pagos en cuotas con
verificación, proyectos Labs, clientes/propuestas/servicios/contratos
Enterprise, comunicaciones/tickets de soporte y reportes.

- **Backend**: Node.js + Express + `mssql` (consultas parametrizadas), JWT.
- **Frontend**: React + Vite.
- **Base de datos**: Microsoft SQL Server (`estudia_db`, esquema en `tables.sql`).

## Estructura del proyecto

```
ESTUD-IA/
├── tables.sql              # DDL autoritativo (CREATE TABLE, 23 tablas)
├── estudia_db.sql          # Datos de prueba (INSERT)
├── backend/                # API REST Express
│   ├── db.js                # Pool de conexión mssql
│   ├── server.js             # Punto de entrada
│   ├── middleware/            # auth (JWT), manejo de errores
│   ├── controllers/           # Lógica de negocio por entidad
│   ├── routes/                 # Definición de endpoints REST
│   └── seed/reset-passwords.js # Hashea contraseñas de prueba con bcrypt
└── frontend/                # React (Vite)
    └── src/
        ├── api/client.js       # Axios + interceptor JWT
        ├── context/AuthContext.jsx
        ├── components/         # Layout, DataTable, Modal, EntityForm genéricos
        └── pages/               # Un módulo por requerimiento funcional
```

## 1. Requisitos previos

- Node.js 18+
- Microsoft SQL Server 2019+ (local o remoto) con acceso mediante usuario SQL o Windows Auth.

## 2. Cargar la base de datos

En SQL Server Management Studio (o `sqlcmd`), ejecutar en este orden:

```
1) tables.sql        -- crea la base estudia_db y las 23 tablas
2) estudia_db.sql     -- carga los datos de prueba
```

```bash
sqlcmd -S localhost -U sa -P "<tu_password>" -f 65001 -i tables.sql
sqlcmd -S localhost -U sa -P "<tu_password>" -f 65001 -i estudia_db.sql
```

El flag `-f 65001` (codepage UTF-8) es obligatorio: sin él, sqlcmd no
detecta la codificación del archivo y los acentos/ñ de los literales
`N'...'` se guardan mal (verificado en este equipo).

## 3. Backend

```bash
cd backend
npm install
cp .env.example .env      # editar credenciales de SQL Server y JWT_SECRET
npm run seed:passwords    # hashea con bcrypt las contraseñas de los usuarios de prueba
npm run dev                # o: npm start
```

El servidor queda escuchando en `http://localhost:4000` (configurable con `PORT`).

`npm run seed:passwords` deja la contraseña **`Estudia2026!`** para **todos**
los usuarios de prueba cargados por `estudia_db.sql` (por ejemplo
`gustavo.garcia@estudia.pe` como ADMINISTRADOR, `leydy.jaico@estudia.pe`
como DOCENTE, etc.). Ejecutarlo una sola vez tras cargar la base de datos.

### Variables de entorno (`backend/.env`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (default 4000) |
| `DB_SERVER`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` | Conexión a SQL Server |
| `DB_ENCRYPT`, `DB_TRUST_SERVER_CERTIFICATE` | Opciones TLS del driver mssql |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Firma y expiración del token |
| `CORS_ORIGIN` | Origen permitido (URL del frontend) |

## 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
npm run dev
```

Abrir `http://localhost:5173` e iniciar sesión con cualquier usuario de
prueba y la contraseña `Estudia2026!`.

## 5. Endpoints principales

Todas las rutas (excepto `/api/auth/login` y `POST /api/mensajes-contacto`,
el formulario público de contacto) requieren `Authorization: Bearer <token>`.

- `POST /api/auth/login`, `GET /api/auth/me`
- CRUD REST estándar (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`)
  para: `usuarios`, `cursos`, `grupos`, `sesiones`, `matriculas`,
  `asistencias`, `notas`, `tareas`, `entregas`, `clientes`, `propuestas`,
  `servicios`, `contratos`, `proyectos`, `integrantes`, `pagos`,
  `comunicaciones`, `notificaciones`, `mensajes-contacto`.
- `PUT /api/grupos/:id/asignar-docente` — asigna docente y lo notifica (RF-08).
- `POST /api/asistencias/sesion/:idSesion/masivo` — registro de asistencia por sesión.
- `PUT /api/entregas/:id/calificar` — calificación de entregas.
- `PUT /api/pagos/:id/verificar` — verifica un pago dentro de la ventana de 24h (RF-06).
- `GET /api/academico/:idEstudiante/estado` — estado académico (RF-09).
- `GET /api/academico/:idEstudiante/certificado` — emite certificado digital (RF-09).
- `GET /api/reportes/*` — los 10 reportes solicitados (ver abajo).

### Los 10 reportes (`/api/reportes/...`)

1. `estudiantes-apoderado`
2. `porcentaje-asistencia`
3. `entregas-pendientes`
4. `proyectos-en-desarrollo`
5. `clientes-servicios-activos`
6. `cuotas-pendientes`
7. `comunicaciones-abiertas`
8. `docentes-grupos`
9. `aptos-certificacion`
10. `tiempo-atencion-tickets`

## 6. Notas de diseño

- El esquema de base de datos **no fue modificado**; se usó `tables.sql` tal
  cual como fuente de verdad para tipos, longitudes, PK/FK y `CHECK`.
- Todas las consultas usan parámetros tipados de `mssql` (`request.input`),
  sin concatenación de strings — previene inyección SQL.
- Los pagos `PENDIENTE` cuya ventana de 24 horas venció se marcan
  automáticamente `EN_MORA` (tanto al listar como al intentar verificarlos).
- El estado académico se calcula como promedio de `NOTA` (aprobado ≥ 11/20);
  el certificado solo se emite si el estado es `APROBADO` y no existen pagos
  de sus matrículas distintos de `PAGADO`.
- Roles soportados: `ADMINISTRADOR`, `DOCENTE`, `ESTUDIANTE`, `DESARROLLADOR`
  (el enunciado pide roles administrador/docente; se añadieron los otros dos
  porque el esquema de `USUARIO.rol` ya los contempla).

## 7. Solución de problemas comunes (SQL Server local en Windows)

Validado en este equipo contra una instancia real `MSSQLSERVER` (SQL Server
2025). Si tu instalación es nueva, es probable que necesites estos tres
ajustes antes de que el backend pueda conectarse:

1. **Modo de autenticación mixto**. Por defecto SQL Server solo acepta
   autenticación de Windows. El driver `mssql`/tedious que usa el backend
   Node **requiere un login SQL** (usuario/contraseña) — no soporta
   "Trusted Connection" nativo. Para habilitarlo:
   ```sql
   EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE',
     N'Software\Microsoft\MSSQLServer\MSSQLServer', N'LoginMode', REG_DWORD, 2;
   ```
   y reiniciar el servicio (`Restart-Service -Name MSSQLSERVER -Force`,
   como administrador).

2. **Protocolo TCP/IP habilitado**. Muchas instalaciones por defecto solo
   tienen memoria compartida/named pipes activos (por lo que `sqlcmd -S
   localhost -E` funciona pero Node no). Para habilitarlo:
   ```sql
   EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE',
     N'Software\Microsoft\MSSQLServer\MSSQLServer\SuperSocketNetLib\Tcp',
     N'Enabled', REG_DWORD, 1;
   ```
   y reiniciar el servicio de nuevo. Verifica con
   `Test-NetConnection -ComputerName localhost -Port 1433`.

3. **Login dedicado para la app** (no uses `sa` en producción):
   ```sql
   CREATE LOGIN estudia_app WITH PASSWORD = N'<password-fuerte>', CHECK_POLICY = ON;
   USE estudia_db;
   CREATE USER estudia_app FOR LOGIN estudia_app;
   ALTER ROLE db_owner ADD MEMBER estudia_app;
   ```
   y usar esas credenciales en `backend/.env` (`DB_USER`, `DB_PASSWORD`).

4. **Codificación de acentos/ñ al cargar `tables.sql` / `estudia_db.sql`**.
   Por defecto `sqlcmd` no detecta que estos archivos están en UTF-8, y los
   literales `N'García'`, `N'Huamán'`, etc. se insertan mal codificados
   (mojibake real en la base, no solo en la consola). **Solución verificada:**
   cargar ambos archivos con el flag `-f 65001` (codepage UTF-8), **sin BOM**
   en el archivo:
   ```bash
   sqlcmd -S localhost -E -f 65001 -i tables.sql
   sqlcmd -S localhost -E -f 65001 -i estudia_db.sql
   ```
   Ojo: agregar un BOM UTF-8 al archivo (como sugieren algunas guías) **no
   funciona combinado con `-f 65001`** — produce `Msg 102: Incorrect syntax
   near '?'` porque sqlcmd interpreta los bytes del BOM como texto. Si ya
   cargaste los datos mal codificados, recrea la base y vuelve a cargar con
   `-f 65001`:
   ```sql
   ALTER DATABASE estudia_db SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
   DROP DATABASE estudia_db;
   ```

5. **Puerto 4000 ocupado por otro proceso**. Si ya tienes otro servicio en
   `localhost:4000`, cambia `PORT` en `backend/.env` y `VITE_API_URL` en
   `frontend/.env` al mismo puerto nuevo (por ejemplo `4001`).
