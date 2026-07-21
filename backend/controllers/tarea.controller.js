const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ESTADOS = ['ABIERTA', 'CERRADA'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `SELECT t.*, c.nombreCurso FROM TAREA t JOIN CURSO c ON c.idCurso = t.idCurso`;
  if (req.query.idCurso) {
    request.input('idCurso', sql.Int, parseId(req.query.idCurso, 'idCurso'));
    query += ' WHERE t.idCurso = @idCurso';
  }
  query += ' ORDER BY t.fechaEntrega DESC';
  const result = await request.query(query);
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id)
    .query('SELECT t.*, c.nombreCurso FROM TAREA t JOIN CURSO c ON c.idCurso = t.idCurso WHERE t.idTarea = @id');
  if (!result.recordset[0]) throw new ApiError(404, 'Tarea no encontrada.');
  res.json(result.recordset[0]);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idCurso', 'titulo', 'fechaPublicacion', 'fechaEntrega']);
  const { idCurso, titulo, descripcion, fechaPublicacion, fechaEntrega, archivoAdjunto, estado } = req.body;
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('idCurso', sql.Int, idCurso)
    .input('titulo', sql.NVarChar(120), titulo)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .input('fechaPublicacion', sql.Date, fechaPublicacion)
    .input('fechaEntrega', sql.Date, fechaEntrega)
    .input('archivoAdjunto', sql.NVarChar(255), archivoAdjunto || null)
    .input('estado', sql.NVarChar(15), estado || 'ABIERTA')
    .query(`INSERT INTO TAREA (idCurso, titulo, descripcion, fechaPublicacion, fechaEntrega, archivoAdjunto, estado)
            OUTPUT INSERTED.idTarea
            VALUES (@idCurso, @titulo, @descripcion, @fechaPublicacion, @fechaEntrega, @archivoAdjunto, @estado)`);
  res.status(201).json({ idTarea: result.recordset[0].idTarea, mensaje: 'Tarea creada correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['titulo', 'fechaPublicacion', 'fechaEntrega']);
  const { titulo, descripcion, fechaPublicacion, fechaEntrega, archivoAdjunto, estado } = req.body;
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('titulo', sql.NVarChar(120), titulo)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .input('fechaPublicacion', sql.Date, fechaPublicacion)
    .input('fechaEntrega', sql.Date, fechaEntrega)
    .input('archivoAdjunto', sql.NVarChar(255), archivoAdjunto || null)
    .input('estado', sql.NVarChar(15), estado || 'ABIERTA')
    .query(`UPDATE TAREA SET titulo=@titulo, descripcion=@descripcion, fechaPublicacion=@fechaPublicacion,
              fechaEntrega=@fechaEntrega, archivoAdjunto=@archivoAdjunto, estado=@estado WHERE idTarea=@id`);
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Tarea no encontrada.');
  res.json({ mensaje: 'Tarea actualizada correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM TAREA WHERE idTarea = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Tarea no encontrada.');
  res.json({ mensaje: 'Tarea eliminada correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
