const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ESTADOS = ['VIGENTE', 'CERRADO'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT co.*, s.nombreServicio, cl.ruc, cl.representante
    FROM CONTRATO co
    JOIN SERVICIO s ON s.idServicio = co.idServicio
    JOIN CLIENTE cl ON cl.idCliente = co.idCliente
    ORDER BY co.idContrato DESC`);
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query(`
    SELECT co.*, s.nombreServicio, cl.ruc, cl.representante
    FROM CONTRATO co
    JOIN SERVICIO s ON s.idServicio = co.idServicio
    JOIN CLIENTE cl ON cl.idCliente = co.idCliente
    WHERE co.idContrato = @id`);
  if (!result.recordset[0]) throw new ApiError(404, 'Contrato no encontrado.');
  res.json(result.recordset[0]);
});

// RF-05: contrato derivado de un servicio
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idServicio', 'monto']);
  const { idServicio, monto, fechaFin, estadoContratado, archivoContrato } = req.body;
  if (estadoContratado && !ESTADOS.includes(estadoContratado)) throw new ApiError(400, `estadoContratado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const servicio = await pool.request().input('id', sql.Int, idServicio).query('SELECT idCliente FROM SERVICIO WHERE idServicio = @id');
  if (!servicio.recordset[0]) throw new ApiError(404, 'Servicio no encontrado.');

  const result = await pool.request()
    .input('idServicio', sql.Int, idServicio)
    .input('idCliente', sql.Int, servicio.recordset[0].idCliente)
    .input('monto', sql.Decimal(10, 2), monto)
    .input('fechaFin', sql.Date, fechaFin || null)
    .input('estadoContratado', sql.NVarChar(10), estadoContratado || 'VIGENTE')
    .input('archivoContrato', sql.NVarChar(255), archivoContrato || null)
    .query(`INSERT INTO CONTRATO (idServicio, idCliente, monto, fechaFin, estadoContratado, archivoContrato)
            OUTPUT INSERTED.idContrato
            VALUES (@idServicio, @idCliente, @monto, @fechaFin, @estadoContratado, @archivoContrato)`);
  res.status(201).json({ idContrato: result.recordset[0].idContrato, mensaje: 'Contrato registrado correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['monto']);
  const { monto, fechaFin, estadoContratado, archivoContrato } = req.body;
  if (estadoContratado && !ESTADOS.includes(estadoContratado)) throw new ApiError(400, `estadoContratado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('monto', sql.Decimal(10, 2), monto)
    .input('fechaFin', sql.Date, fechaFin || null)
    .input('estadoContratado', sql.NVarChar(10), estadoContratado || 'VIGENTE')
    .input('archivoContrato', sql.NVarChar(255), archivoContrato || null)
    .query('UPDATE CONTRATO SET monto=@monto, fechaFin=@fechaFin, estadoContratado=@estadoContratado, archivoContrato=@archivoContrato WHERE idContrato=@id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Contrato no encontrado.');
  res.json({ mensaje: 'Contrato actualizado correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM CONTRATO WHERE idContrato = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Contrato no encontrado.');
  res.json({ mensaje: 'Contrato eliminado correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
