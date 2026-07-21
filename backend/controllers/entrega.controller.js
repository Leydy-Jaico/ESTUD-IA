const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `
    SELECT e.*, t.titulo, u.nombres, u.apellidos
    FROM ENTREGA_TAREA e
    JOIN TAREA t ON t.idTarea = e.idTarea
    JOIN USUARIO u ON u.idUsuario = e.idEstudiante`;
  const conditions = [];
  if (req.query.idTarea) {
    request.input('idTarea', sql.Int, parseId(req.query.idTarea, 'idTarea'));
    conditions.push('e.idTarea = @idTarea');
  }
  if (req.query.idEstudiante) {
    request.input('idEstudiante', sql.Int, parseId(req.query.idEstudiante, 'idEstudiante'));
    conditions.push('e.idEstudiante = @idEstudiante');
  }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY e.fechaEntrega DESC';
  const result = await request.query(query);
  res.json(result.recordset);
});

// Entrega de un estudiante (RF-03)
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idTarea', 'idEstudiante']);
  const { idTarea, idEstudiante, archivoEntregado, observacion } = req.body;

  const pool = await poolPromise;

  const tarea = await pool.request().input('id', sql.Int, idTarea).query('SELECT fechaEntrega FROM TAREA WHERE idTarea = @id');
  if (!tarea.recordset[0]) throw new ApiError(404, 'Tarea no encontrada.');

  const hoy = new Date();
  const fechaLimite = new Date(tarea.recordset[0].fechaEntrega);
  const estado = hoy > fechaLimite ? 'FUERA_DE_PLAZO' : 'ENTREGADA';

  const result = await pool.request()
    .input('idTarea', sql.Int, idTarea)
    .input('idEstudiante', sql.Int, idEstudiante)
    .input('archivoEntregado', sql.NVarChar(255), archivoEntregado || null)
    .input('estado', sql.NVarChar(15), estado)
    .input('observacion', sql.NVarChar(150), observacion || null)
    .query(`INSERT INTO ENTREGA_TAREA (idTarea, idEstudiante, archivoEntregado, estado, observacion)
            OUTPUT INSERTED.idEntrega
            VALUES (@idTarea, @idEstudiante, @archivoEntregado, @estado, @observacion)`);
  res.status(201).json({ idEntrega: result.recordset[0].idEntrega, estado, mensaje: 'Entrega registrada correctamente.' });
});

// Calificar entrega (RF-03)
const calificar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['calificacion']);
  const { calificacion, observacion } = req.body;
  if (calificacion < 0 || calificacion > 20) throw new ApiError(400, 'La calificación debe estar entre 0 y 20.');

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('calificacion', sql.Decimal(4, 2), calificacion)
    .input('observacion', sql.NVarChar(150), observacion || null)
    .query(`UPDATE ENTREGA_TAREA SET calificacion=@calificacion, estado='CALIFICADA', observacion=@observacion
            WHERE idEntrega=@id`);
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Entrega no encontrada.');
  res.json({ mensaje: 'Entrega calificada correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM ENTREGA_TAREA WHERE idEntrega = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Entrega no encontrada.');
  res.json({ mensaje: 'Entrega eliminada correctamente.' });
});

module.exports = { listar, crear, calificar, eliminar };
