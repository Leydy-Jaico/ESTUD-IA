const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');

// 1) Estudiantes con su apoderado
const estudiantesConApoderado = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT u.idUsuario AS idEstudiante, u.nombres, u.apellidos, e.dni,
           ap.idApoderado, ap.nombre AS nombreApoderado, ap.apellidos AS apellidosApoderado,
           ap.parentesco, ap.celular
    FROM ESTUDIANTE e
    JOIN USUARIO u ON u.idUsuario = e.idUsuario
    LEFT JOIN APODERADO ap ON ap.idEstudiante = e.idUsuario
    ORDER BY u.apellidos, u.nombres`);
  res.json(result.recordset);
});

// 2) % de asistencia por estudiante y grupo
const porcentajeAsistencia = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT u.idUsuario AS idEstudiante, u.nombres, u.apellidos, g.idGrupo, g.nombreGrupo,
           COUNT(a.idAsistencia) AS totalSesionesRegistradas,
           SUM(CASE WHEN a.estadoAsistencia IN ('PRESENTE', 'TARDANZA') THEN 1 ELSE 0 END) AS asistencias,
           CAST(
             CASE WHEN COUNT(a.idAsistencia) = 0 THEN 0
                  ELSE 100.0 * SUM(CASE WHEN a.estadoAsistencia IN ('PRESENTE', 'TARDANZA') THEN 1 ELSE 0 END) / COUNT(a.idAsistencia)
             END AS DECIMAL(5,2)) AS porcentajeAsistencia
    FROM ESTUDIANTE e
    JOIN USUARIO u ON u.idUsuario = e.idUsuario
    JOIN GRUPO g ON g.idGrupo = e.idGrupo
    LEFT JOIN SESION s ON s.idGrupo = g.idGrupo
    LEFT JOIN ASISTENCIA a ON a.idSesion = s.idSesion AND a.idEstudiante = e.idUsuario
    GROUP BY u.idUsuario, u.nombres, u.apellidos, g.idGrupo, g.nombreGrupo
    ORDER BY g.nombreGrupo, u.apellidos`);
  res.json(result.recordset);
});

// 3) Entregas pendientes de calificar
const entregasPendientes = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT et.idEntrega, t.titulo, u.nombres, u.apellidos, et.fechaEntrega, et.estado
    FROM ENTREGA_TAREA et
    JOIN TAREA t ON t.idTarea = et.idTarea
    JOIN USUARIO u ON u.idUsuario = et.idEstudiante
    WHERE et.estado <> 'CALIFICADA'
    ORDER BY et.fechaEntrega`);
  res.json(result.recordset);
});

// 4) Proyectos Labs en desarrollo y su equipo
const proyectosEnDesarrollo = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT p.idProyecto, p.nombreProyecto, p.fechaLimite, p.estado,
           i.idUsuario, u.nombres, u.apellidos, i.rolProyecto
    FROM PROYECTO p
    LEFT JOIN INTEGRANTE_PROYECTO i ON i.idProyecto = p.idProyecto
    LEFT JOIN USUARIO u ON u.idUsuario = i.idUsuario
    WHERE p.estado = 'DESARROLLO'
    ORDER BY p.fechaLimite`);
  res.json(result.recordset);
});

// 5) Clientes con servicios activos
const clientesConServiciosActivos = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT c.idCliente, c.ruc, c.representante, s.idServicio, s.nombreServicio, s.precio, s.estado
    FROM CLIENTE c
    JOIN SERVICIO s ON s.idCliente = c.idCliente
    WHERE s.estado = 'ACTIVO'
    ORDER BY c.representante`);
  res.json(result.recordset);
});

// 6) Estudiantes con cuotas pendientes o en mora
const estudiantesConCuotasPendientes = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  await pool.request().query(`
    UPDATE PAGO SET estadoPago = 'EN_MORA'
    WHERE estadoPago = 'PENDIENTE' AND fechaPago < DATEADD(HOUR, -24, SYSDATETIME())`);

  const result = await pool.request().query(`
    SELECT u.idUsuario AS idEstudiante, u.nombres, u.apellidos, m.idMatricula, g.nombreGrupo,
           pg.idPago, pg.monto, pg.estadoPago, pg.fechaPago
    FROM PAGO pg
    JOIN MATRICULA m ON m.idMatricula = pg.idMatricula
    JOIN USUARIO u ON u.idUsuario = m.idEstudiante
    JOIN GRUPO g ON g.idGrupo = m.idGrupo
    WHERE pg.estadoPago IN ('PENDIENTE', 'EN_MORA')
    ORDER BY pg.fechaPago`);
  res.json(result.recordset);
});

// 7) Comunicaciones abiertas por usuario
const comunicacionesAbiertasPorUsuario = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT u.idUsuario, u.nombres, u.apellidos, COUNT(c.idComunicacion) AS comunicacionesAbiertas
    FROM COMUNICACION c
    JOIN USUARIO u ON u.idUsuario = c.idUsuario
    WHERE c.estado IN ('ABIERTO', 'ASIGNADO')
    GROUP BY u.idUsuario, u.nombres, u.apellidos
    ORDER BY comunicacionesAbiertas DESC`);
  res.json(result.recordset);
});

// 8) Docentes activos y grupos a cargo
const docentesActivosConGrupos = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT u.idUsuario AS idDocente, u.nombres, u.apellidos,
           g.idGrupo, g.nombreGrupo, g.estado AS estadoGrupo, c.nombreCurso
    FROM USUARIO u
    JOIN GRUPO g ON g.idDocente = u.idUsuario
    JOIN CURSO c ON c.idCurso = g.idCurso
    WHERE u.rol = 'DOCENTE' AND g.estado IN ('PROGRAMADO', 'EN_CURSO')
    ORDER BY u.apellidos, g.nombreGrupo`);
  res.json(result.recordset);
});

// 9) Estudiantes aptos para certificación (promedio >= 11 y sin cuotas pendientes/en mora)
const estudiantesAptosCertificacion = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT u.idUsuario AS idEstudiante, u.nombres, u.apellidos, e.dni,
           AVG(n.nota) AS promedio
    FROM ESTUDIANTE e
    JOIN USUARIO u ON u.idUsuario = e.idUsuario
    JOIN NOTA n ON n.idEstudiante = e.idUsuario
    WHERE NOT EXISTS (
      SELECT 1 FROM PAGO pg
      JOIN MATRICULA m ON m.idMatricula = pg.idMatricula
      WHERE m.idEstudiante = e.idUsuario AND pg.estadoPago <> 'PAGADO'
    )
    GROUP BY u.idUsuario, u.nombres, u.apellidos, e.dni
    HAVING AVG(n.nota) >= 11
    ORDER BY promedio DESC`);
  res.json(result.recordset);
});

// 10) Tiempo promedio de atención de tickets Enterprise
const tiempoPromedioAtencionTickets = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT COUNT(*) AS ticketsResueltos, AVG(tiempoAtencionHoras) AS promedioHoras
    FROM COMUNICACION
    WHERE tipoComunicacion = 'TICKET_SOPORTE' AND tiempoAtencionHoras IS NOT NULL`);
  res.json(result.recordset[0]);
});

module.exports = {
  estudiantesConApoderado,
  porcentajeAsistencia,
  entregasPendientes,
  proyectosEnDesarrollo,
  clientesConServiciosActivos,
  estudiantesConCuotasPendientes,
  comunicacionesAbiertasPorUsuario,
  docentesActivosConGrupos,
  estudiantesAptosCertificacion,
  tiempoPromedioAtencionTickets
};
