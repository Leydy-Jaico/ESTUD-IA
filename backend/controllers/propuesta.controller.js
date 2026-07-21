const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ESTADOS = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `SELECT p.*, c.ruc, c.representante FROM PROPUESTA p JOIN CLIENTE c ON c.idCliente = p.idCliente`;
  if (req.query.idCliente) {
    request.input('idCliente', sql.Int, parseId(req.query.idCliente, 'idCliente'));
    query += ' WHERE p.idCliente = @idCliente';
  }
  query += ' ORDER BY p.fechaEmision DESC';
  const result = await request.query(query);
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id)
    .query('SELECT p.*, c.ruc, c.representante FROM PROPUESTA p JOIN CLIENTE c ON c.idCliente = p.idCliente WHERE p.idPropuesta = @id');
  if (!result.recordset[0]) throw new ApiError(404, 'Propuesta no encontrada.');
  res.json(result.recordset[0]);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idCliente', 'monto', 'fechaEmision']);
  const { idCliente, descripcion, monto, fechaEmision, fechaRespuesta, estado } = req.body;
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('idCliente', sql.Int, idCliente)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .input('monto', sql.Decimal(10, 2), monto)
    .input('fechaEmision', sql.Date, fechaEmision)
    .input('fechaRespuesta', sql.Date, fechaRespuesta || null)
    .input('estado', sql.NVarChar(15), estado || 'PENDIENTE')
    .query(`INSERT INTO PROPUESTA (idCliente, descripcion, monto, fechaEmision, fechaRespuesta, estado)
            OUTPUT INSERTED.idPropuesta
            VALUES (@idCliente, @descripcion, @monto, @fechaEmision, @fechaRespuesta, @estado)`);
  res.status(201).json({ idPropuesta: result.recordset[0].idPropuesta, mensaje: 'Propuesta registrada correctamente.' });
});

// Cambiar estado (aprobar/rechazar) — RF-05
const actualizarEstado = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['estado']);
  const { estado, fechaRespuesta } = req.body;
  if (!ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('estado', sql.NVarChar(15), estado)
    .input('fechaRespuesta', sql.Date, fechaRespuesta || new Date())
    .query('UPDATE PROPUESTA SET estado=@estado, fechaRespuesta=@fechaRespuesta WHERE idPropuesta=@id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Propuesta no encontrada.');
  res.json({ mensaje: `Propuesta actualizada a estado ${estado}.` });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM PROPUESTA WHERE idPropuesta = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Propuesta no encontrada.');
  res.json({ mensaje: 'Propuesta eliminada correctamente.' });
});

module.exports = { listar, obtener, crear, actualizarEstado, eliminar };
