const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = 'SELECT * FROM NOTIFICACION';
  if (req.query.idUsuario) {
    request.input('idUsuario', sql.Int, parseId(req.query.idUsuario, 'idUsuario'));
    query += ' WHERE idUsuario = @idUsuario';
  }
  query += ' ORDER BY fecha DESC';
  const result = await request.query(query);
  res.json(result.recordset);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idUsuario', 'titulo']);
  const { idUsuario, titulo, descripcion } = req.body;
  const pool = await poolPromise;
  const result = await pool.request()
    .input('idUsuario', sql.Int, idUsuario)
    .input('titulo', sql.NVarChar(100), titulo)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .query(`INSERT INTO NOTIFICACION (idUsuario, titulo, descripcion)
            OUTPUT INSERTED.idNotificacion
            VALUES (@idUsuario, @titulo, @descripcion)`);
  res.status(201).json({ idNotificacion: result.recordset[0].idNotificacion, mensaje: 'Notificación creada correctamente.' });
});

const marcarLeida = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id)
    .query("UPDATE NOTIFICACION SET estadoNotificacion = 'LEIDA' WHERE idNotificacion = @id");
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Notificación no encontrada.');
  res.json({ mensaje: 'Notificación marcada como leída.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM NOTIFICACION WHERE idNotificacion = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Notificación no encontrada.');
  res.json({ mensaje: 'Notificación eliminada correctamente.' });
});

module.exports = { listar, crear, marcarLeida, eliminar };
