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

module.exports = { dashboardEstudiante, dashboardDocente, dashboardDesarrollador, dashboardAdministrador };
