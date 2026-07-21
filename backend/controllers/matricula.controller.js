const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ESTADOS = ['ACTIVA', 'RETIRADA', 'FINALIZADA'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT m.*, u.nombres, u.apellidos, g.nombreGrupo
    FROM MATRICULA m
    JOIN USUARIO u ON u.idUsuario = m.idEstudiante
    JOIN GRUPO g ON g.idGrupo = m.idGrupo
    ORDER BY m.idMatricula DESC`);
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query(`
    SELECT m.*, u.nombres, u.apellidos, g.nombreGrupo
    FROM MATRICULA m
    JOIN USUARIO u ON u.idUsuario = m.idEstudiante
    JOIN GRUPO g ON g.idGrupo = m.idGrupo
    WHERE m.idMatricula = @id`);
  if (!result.recordset[0]) throw new ApiError(404, 'Matrícula no encontrada.');
  res.json(result.recordset[0]);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idEstudiante', 'idGrupo']);
  const { idEstudiante, idGrupo, observaciones } = req.body;
  const pool = await poolPromise;

  const estudiante = await pool.request().input('id', sql.Int, idEstudiante)
    .query('SELECT idUsuario FROM ESTUDIANTE WHERE idUsuario = @id');
  if (!estudiante.recordset[0]) throw new ApiError(400, 'El estudiante indicado no existe.');

  const result = await pool.request()
    .input('idEstudiante', sql.Int, idEstudiante)
    .input('idGrupo', sql.Int, idGrupo)
    .input('observaciones', sql.NVarChar(200), observaciones || null)
    .query(`INSERT INTO MATRICULA (idEstudiante, idGrupo, observaciones)
            OUTPUT INSERTED.idMatricula
            VALUES (@idEstudiante, @idGrupo, @observaciones)`);
  res.status(201).json({ idMatricula: result.recordset[0].idMatricula, mensaje: 'Matrícula registrada correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['estadoMatricula']);
  const { estadoMatricula, observaciones } = req.body;
  if (!ESTADOS.includes(estadoMatricula)) throw new ApiError(400, `estadoMatricula inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('estadoMatricula', sql.NVarChar(15), estadoMatricula)
    .input('observaciones', sql.NVarChar(200), observaciones || null)
    .query('UPDATE MATRICULA SET estadoMatricula=@estadoMatricula, observaciones=@observaciones WHERE idMatricula=@id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Matrícula no encontrada.');
  res.json({ mensaje: 'Matrícula actualizada correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM MATRICULA WHERE idMatricula = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Matrícula no encontrada.');
  res.json({ mensaje: 'Matrícula eliminada correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
