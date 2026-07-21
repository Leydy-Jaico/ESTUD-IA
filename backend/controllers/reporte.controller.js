const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT r.*, u.nombres, u.apellidos
    FROM REPORTE r JOIN USUARIO u ON u.idUsuario = r.generadoPor
    ORDER BY r.fechaGeneracion DESC`);
  res.json(result.recordset);
});

// Deja constancia de que un reporte fue generado (nombre del archivo exportado, etc.)
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['tipoReporte']);
  const { tipoReporte, archivoReporte } = req.body;
  const pool = await poolPromise;
  const result = await pool.request()
    .input('tipoReporte', sql.NVarChar(60), tipoReporte)
    .input('generadoPor', sql.Int, req.user.idUsuario)
    .input('archivoReporte', sql.NVarChar(255), archivoReporte || null)
    .query(`INSERT INTO REPORTE (tipoReporte, generadoPor, archivoReporte)
            OUTPUT INSERTED.idReporte
            VALUES (@tipoReporte, @generadoPor, @archivoReporte)`);
  res.status(201).json({ idReporte: result.recordset[0].idReporte, mensaje: 'Reporte registrado correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM REPORTE WHERE idReporte = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Reporte no encontrado.');
  res.json({ mensaje: 'Reporte eliminado correctamente.' });
});

module.exports = { listar, crear, eliminar };
