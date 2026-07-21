const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ESTADOS = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT g.*, c.nombreCurso, u.nombres AS docenteNombres, u.apellidos AS docenteApellidos
    FROM GRUPO g
    JOIN CURSO c ON c.idCurso = g.idCurso
    LEFT JOIN USUARIO u ON u.idUsuario = g.idDocente
    ORDER BY g.idGrupo`);
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query(`
    SELECT g.*, c.nombreCurso, u.nombres AS docenteNombres, u.apellidos AS docenteApellidos
    FROM GRUPO g
    JOIN CURSO c ON c.idCurso = g.idCurso
    LEFT JOIN USUARIO u ON u.idUsuario = g.idDocente
    WHERE g.idGrupo = @id`);
  if (!result.recordset[0]) throw new ApiError(404, 'Grupo no encontrado.');
  res.json(result.recordset[0]);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idCurso', 'nombreGrupo', 'fechaInicio', 'cupos']);
  const { idCurso, idDocente, nombreGrupo, fechaInicio, fechaFin, horario, cupos, estado } = req.body;

  if (estado && !ESTADOS.includes(estado)) {
    throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);
  }

  const pool = await poolPromise;
  const result = await pool.request()
    .input('idCurso', sql.Int, idCurso)
    .input('idDocente', sql.Int, idDocente || null)
    .input('nombreGrupo', sql.NVarChar(60), nombreGrupo)
    .input('fechaInicio', sql.Date, fechaInicio)
    .input('fechaFin', sql.Date, fechaFin || null)
    .input('horario', sql.NVarChar(60), horario || null)
    .input('cupos', sql.Int, cupos)
    .input('estado', sql.NVarChar(20), estado || 'PROGRAMADO')
    .query(`INSERT INTO GRUPO (idCurso, idDocente, nombreGrupo, fechaInicio, fechaFin, horario, cupos, estado)
            OUTPUT INSERTED.idGrupo
            VALUES (@idCurso, @idDocente, @nombreGrupo, @fechaInicio, @fechaFin, @horario, @cupos, @estado)`);

  const idGrupo = result.recordset[0].idGrupo;

  if (idDocente) {
    await notificarAsignacion(pool, idDocente, idGrupo, nombreGrupo);
  }

  res.status(201).json({ idGrupo, mensaje: 'Grupo creado correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['idCurso', 'nombreGrupo', 'fechaInicio', 'cupos']);
  const { idCurso, idDocente, nombreGrupo, fechaInicio, fechaFin, horario, cupos, estado } = req.body;

  if (estado && !ESTADOS.includes(estado)) {
    throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);
  }

  const pool = await poolPromise;

  const previo = await pool.request().input('id', sql.Int, id).query('SELECT idDocente FROM GRUPO WHERE idGrupo = @id');
  if (!previo.recordset[0]) throw new ApiError(404, 'Grupo no encontrado.');
  const docenteAnterior = previo.recordset[0].idDocente;

  await pool.request()
    .input('id', sql.Int, id)
    .input('idCurso', sql.Int, idCurso)
    .input('idDocente', sql.Int, idDocente || null)
    .input('nombreGrupo', sql.NVarChar(60), nombreGrupo)
    .input('fechaInicio', sql.Date, fechaInicio)
    .input('fechaFin', sql.Date, fechaFin || null)
    .input('horario', sql.NVarChar(60), horario || null)
    .input('cupos', sql.Int, cupos)
    .input('estado', sql.NVarChar(20), estado || 'PROGRAMADO')
    .query(`UPDATE GRUPO SET idCurso=@idCurso, idDocente=@idDocente, nombreGrupo=@nombreGrupo,
              fechaInicio=@fechaInicio, fechaFin=@fechaFin, horario=@horario, cupos=@cupos, estado=@estado
            WHERE idGrupo=@id`);

  if (idDocente && idDocente !== docenteAnterior) {
    await notificarAsignacion(pool, idDocente, id, nombreGrupo);
  }

  res.json({ mensaje: 'Grupo actualizado correctamente.' });
});

// PUT /api/grupos/:id/asignar-docente  (RF-08)
const asignarDocente = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['idDocente']);
  const { idDocente } = req.body;

  const pool = await poolPromise;

  const docente = await pool.request().input('id', sql.Int, idDocente)
    .query("SELECT idUsuario FROM USUARIO WHERE idUsuario = @id AND rol = 'DOCENTE'");
  if (!docente.recordset[0]) throw new ApiError(400, 'El usuario indicado no es un docente válido.');

  const grupo = await pool.request().input('id', sql.Int, id).query('SELECT nombreGrupo FROM GRUPO WHERE idGrupo = @id');
  if (!grupo.recordset[0]) throw new ApiError(404, 'Grupo no encontrado.');

  await pool.request().input('id', sql.Int, id).input('idDocente', sql.Int, idDocente)
    .query('UPDATE GRUPO SET idDocente = @idDocente WHERE idGrupo = @id');

  await notificarAsignacion(pool, idDocente, id, grupo.recordset[0].nombreGrupo);

  res.json({ mensaje: 'Docente asignado y notificado correctamente.' });
});

async function notificarAsignacion(pool, idDocente, idGrupo, nombreGrupo) {
  await pool.request()
    .input('idUsuario', sql.Int, idDocente)
    .input('titulo', sql.NVarChar(100), 'Asignación a nuevo grupo')
    .input('descripcion', sql.NVarChar(255), `Has sido asignado como docente del grupo "${nombreGrupo}" (idGrupo: ${idGrupo}).`)
    .query(`INSERT INTO NOTIFICACION (idUsuario, titulo, descripcion) VALUES (@idUsuario, @titulo, @descripcion)`);
}

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM GRUPO WHERE idGrupo = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Grupo no encontrado.');
  res.json({ mensaje: 'Grupo eliminado correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, asignarDocente, eliminar };
