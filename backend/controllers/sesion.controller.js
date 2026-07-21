const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const MODALIDADES = ['PRESENCIAL', 'VIRTUAL'];
const ESTADOS = ['PROGRAMADA', 'DICTADA', 'CANCELADA'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `SELECT s.*, g.nombreGrupo FROM SESION s JOIN GRUPO g ON g.idGrupo = s.idGrupo`;
  if (req.query.idGrupo) {
    request.input('idGrupo', sql.Int, parseId(req.query.idGrupo, 'idGrupo'));
    query += ' WHERE s.idGrupo = @idGrupo';
  }
  query += ' ORDER BY s.fecha, s.idSesion';
  const result = await request.query(query);
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id)
    .query(`SELECT s.*, g.nombreGrupo FROM SESION s JOIN GRUPO g ON g.idGrupo = s.idGrupo WHERE s.idSesion = @id`);
  if (!result.recordset[0]) throw new ApiError(404, 'Sesión no encontrada.');
  res.json(result.recordset[0]);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idGrupo', 'fecha', 'modalidad']);
  const { idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado } = req.body;

  if (!MODALIDADES.includes(modalidad)) throw new ApiError(400, `modalidad inválida. Valores permitidos: ${MODALIDADES.join(', ')}`);
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('idGrupo', sql.Int, idGrupo)
    .input('fecha', sql.Date, fecha)
    .input('horaInicio', sql.VarChar(8), horaInicio || null)
    .input('horaFin', sql.VarChar(8), horaFin || null)
    .input('modalidad', sql.NVarChar(15), modalidad)
    .input('tema', sql.NVarChar(150), tema || null)
    .input('estado', sql.NVarChar(15), estado || 'PROGRAMADA')
    .query(`INSERT INTO SESION (idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado)
            OUTPUT INSERTED.idSesion
            VALUES (@idGrupo, @fecha, @horaInicio, @horaFin, @modalidad, @tema, @estado)`);
  res.status(201).json({ idSesion: result.recordset[0].idSesion, mensaje: 'Sesión creada correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['idGrupo', 'fecha', 'modalidad']);
  const { idGrupo, fecha, horaInicio, horaFin, modalidad, tema, estado } = req.body;

  if (!MODALIDADES.includes(modalidad)) throw new ApiError(400, `modalidad inválida. Valores permitidos: ${MODALIDADES.join(', ')}`);
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('idGrupo', sql.Int, idGrupo)
    .input('fecha', sql.Date, fecha)
    .input('horaInicio', sql.VarChar(8), horaInicio || null)
    .input('horaFin', sql.VarChar(8), horaFin || null)
    .input('modalidad', sql.NVarChar(15), modalidad)
    .input('tema', sql.NVarChar(150), tema || null)
    .input('estado', sql.NVarChar(15), estado || 'PROGRAMADA')
    .query(`UPDATE SESION SET idGrupo=@idGrupo, fecha=@fecha, horaInicio=@horaInicio, horaFin=@horaFin,
              modalidad=@modalidad, tema=@tema, estado=@estado WHERE idSesion=@id`);
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Sesión no encontrada.');
  res.json({ mensaje: 'Sesión actualizada correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM SESION WHERE idSesion = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Sesión no encontrada.');
  res.json({ mensaje: 'Sesión eliminada correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
