const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `
    SELECT n.*, u.nombres, u.apellidos, c.nombreCurso
    FROM NOTA n
    JOIN USUARIO u ON u.idUsuario = n.idEstudiante
    JOIN CURSO c ON c.idCurso = n.idCurso`;
  const conditions = [];
  if (req.query.idEstudiante) {
    request.input('idEstudiante', sql.Int, parseId(req.query.idEstudiante, 'idEstudiante'));
    conditions.push('n.idEstudiante = @idEstudiante');
  }
  if (req.query.idCurso) {
    request.input('idCurso', sql.Int, parseId(req.query.idCurso, 'idCurso'));
    conditions.push('n.idCurso = @idCurso');
  }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY n.fechaRegistro DESC';
  const result = await request.query(query);
  res.json(result.recordset);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idEstudiante', 'idCurso', 'tipoEvaluacion', 'nota']);
  const { idEstudiante, idCurso, tipoEvaluacion, nota, observacion } = req.body;
  if (nota < 0 || nota > 20) throw new ApiError(400, 'La nota debe estar entre 0 y 20.');

  const pool = await poolPromise;
  const result = await pool.request()
    .input('idEstudiante', sql.Int, idEstudiante)
    .input('idCurso', sql.Int, idCurso)
    .input('tipoEvaluacion', sql.NVarChar(50), tipoEvaluacion)
    .input('nota', sql.Decimal(4, 2), nota)
    .input('observacion', sql.NVarChar(150), observacion || null)
    .query(`INSERT INTO NOTA (idEstudiante, idCurso, tipoEvaluacion, nota, observacion)
            OUTPUT INSERTED.idNota
            VALUES (@idEstudiante, @idCurso, @tipoEvaluacion, @nota, @observacion)`);
  res.status(201).json({ idNota: result.recordset[0].idNota, mensaje: 'Nota registrada correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['tipoEvaluacion', 'nota']);
  const { tipoEvaluacion, nota, observacion } = req.body;
  if (nota < 0 || nota > 20) throw new ApiError(400, 'La nota debe estar entre 0 y 20.');

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('tipoEvaluacion', sql.NVarChar(50), tipoEvaluacion)
    .input('nota', sql.Decimal(4, 2), nota)
    .input('observacion', sql.NVarChar(150), observacion || null)
    .query('UPDATE NOTA SET tipoEvaluacion=@tipoEvaluacion, nota=@nota, observacion=@observacion WHERE idNota=@id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Nota no encontrada.');
  res.json({ mensaje: 'Nota actualizada correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM NOTA WHERE idNota = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Nota no encontrada.');
  res.json({ mensaje: 'Nota eliminada correctamente.' });
});

module.exports = { listar, crear, actualizar, eliminar };
