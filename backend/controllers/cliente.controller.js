const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ESTADOS = ['ACTIVO', 'INACTIVO'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query('SELECT * FROM CLIENTE ORDER BY idCliente');
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM CLIENTE WHERE idCliente = @id');
  if (!result.recordset[0]) throw new ApiError(404, 'Cliente no encontrado.');
  res.json(result.recordset[0]);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['ruc']);
  const { ruc, representante, correo, direccion, telefono, estadoCliente } = req.body;
  if (estadoCliente && !ESTADOS.includes(estadoCliente)) throw new ApiError(400, `estadoCliente inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('ruc', sql.NVarChar(11), ruc)
    .input('representante', sql.NVarChar(100), representante || null)
    .input('correo', sql.NVarChar(120), correo || null)
    .input('direccion', sql.NVarChar(150), direccion || null)
    .input('telefono', sql.NVarChar(20), telefono || null)
    .input('estadoCliente', sql.NVarChar(10), estadoCliente || 'ACTIVO')
    .query(`INSERT INTO CLIENTE (ruc, representante, correo, direccion, telefono, estadoCliente)
            OUTPUT INSERTED.idCliente
            VALUES (@ruc, @representante, @correo, @direccion, @telefono, @estadoCliente)`);
  res.status(201).json({ idCliente: result.recordset[0].idCliente, mensaje: 'Cliente creado correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['ruc']);
  const { ruc, representante, correo, direccion, telefono, estadoCliente } = req.body;
  if (estadoCliente && !ESTADOS.includes(estadoCliente)) throw new ApiError(400, `estadoCliente inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('ruc', sql.NVarChar(11), ruc)
    .input('representante', sql.NVarChar(100), representante || null)
    .input('correo', sql.NVarChar(120), correo || null)
    .input('direccion', sql.NVarChar(150), direccion || null)
    .input('telefono', sql.NVarChar(20), telefono || null)
    .input('estadoCliente', sql.NVarChar(10), estadoCliente || 'ACTIVO')
    .query(`UPDATE CLIENTE SET ruc=@ruc, representante=@representante, correo=@correo, direccion=@direccion,
              telefono=@telefono, estadoCliente=@estadoCliente WHERE idCliente=@id`);
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Cliente no encontrado.');
  res.json({ mensaje: 'Cliente actualizado correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM CLIENTE WHERE idCliente = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Cliente no encontrado.');
  res.json({ mensaje: 'Cliente eliminado correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
