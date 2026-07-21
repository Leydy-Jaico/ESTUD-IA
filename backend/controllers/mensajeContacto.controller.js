const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query('SELECT * FROM MENSAJE_CONTACTO ORDER BY fechaEnvio DESC');
  res.json(result.recordset);
});

// Público: formulario de contacto del sitio web
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['nombre', 'mensaje']);
  const { nombre, telefono, correo, mensaje } = req.body;
  const pool = await poolPromise;
  const result = await pool.request()
    .input('nombre', sql.NVarChar(100), nombre)
    .input('telefono', sql.NVarChar(20), telefono || null)
    .input('correo', sql.NVarChar(120), correo || null)
    .input('mensaje', sql.NVarChar(255), mensaje)
    .query(`INSERT INTO MENSAJE_CONTACTO (nombre, telefono, correo, mensaje)
            OUTPUT INSERTED.idMensaje
            VALUES (@nombre, @telefono, @correo, @mensaje)`);
  res.status(201).json({ idMensaje: result.recordset[0].idMensaje, mensaje: 'Mensaje enviado correctamente.' });
});

const marcarAtendido = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id)
    .query("UPDATE MENSAJE_CONTACTO SET estadoMensaje = 'ATENDIDO' WHERE idMensaje = @id");
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Mensaje no encontrado.');
  res.json({ mensaje: 'Mensaje marcado como atendido.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM MENSAJE_CONTACTO WHERE idMensaje = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Mensaje no encontrado.');
  res.json({ mensaje: 'Mensaje eliminado correctamente.' });
});

module.exports = { listar, crear, marcarAtendido, eliminar };
