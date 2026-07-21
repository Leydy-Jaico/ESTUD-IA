const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query('SELECT * FROM CURSO ORDER BY idCurso');
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM CURSO WHERE idCurso = @id');
  if (!result.recordset[0]) throw new ApiError(404, 'Curso no encontrado.');
  res.json(result.recordset[0]);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['nombreCurso', 'precio']);
  const { nombreCurso, descripcion, duracion, precio } = req.body;
  const pool = await poolPromise;
  const result = await pool.request()
    .input('nombreCurso', sql.NVarChar(100), nombreCurso)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .input('duracion', sql.Int, duracion || null)
    .input('precio', sql.Decimal(10, 2), precio)
    .query(`INSERT INTO CURSO (nombreCurso, descripcion, duracion, precio)
            OUTPUT INSERTED.idCurso
            VALUES (@nombreCurso, @descripcion, @duracion, @precio)`);
  res.status(201).json({ idCurso: result.recordset[0].idCurso, mensaje: 'Curso creado correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['nombreCurso', 'precio']);
  const { nombreCurso, descripcion, duracion, precio } = req.body;
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nombreCurso', sql.NVarChar(100), nombreCurso)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .input('duracion', sql.Int, duracion || null)
    .input('precio', sql.Decimal(10, 2), precio)
    .query(`UPDATE CURSO SET nombreCurso=@nombreCurso, descripcion=@descripcion, duracion=@duracion, precio=@precio
            WHERE idCurso=@id`);
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Curso no encontrado.');
  res.json({ mensaje: 'Curso actualizado correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM CURSO WHERE idCurso = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Curso no encontrado.');
  res.json({ mensaje: 'Curso eliminado correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
