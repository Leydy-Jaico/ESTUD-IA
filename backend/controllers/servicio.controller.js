const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ESTADOS = ['ACTIVO', 'PAUSADO', 'FINALIZADO'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT s.*, c.ruc, c.representante
    FROM SERVICIO s JOIN CLIENTE c ON c.idCliente = s.idCliente
    ORDER BY s.idServicio DESC`);
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query(`
    SELECT s.*, c.ruc, c.representante
    FROM SERVICIO s JOIN CLIENTE c ON c.idCliente = s.idCliente
    WHERE s.idServicio = @id`);
  if (!result.recordset[0]) throw new ApiError(404, 'Servicio no encontrado.');
  res.json(result.recordset[0]);
});

// RF-05: servicio derivado de una propuesta APROBADA
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idPropuesta', 'nombreServicio', 'precio']);
  const { idPropuesta, nombreServicio, descripcion, precio, estado } = req.body;
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;

  const propuesta = await pool.request().input('id', sql.Int, idPropuesta)
    .query('SELECT idCliente, estado FROM PROPUESTA WHERE idPropuesta = @id');
  if (!propuesta.recordset[0]) throw new ApiError(404, 'Propuesta no encontrada.');
  if (propuesta.recordset[0].estado !== 'APROBADA') {
    throw new ApiError(400, 'Solo se pueden crear servicios a partir de una propuesta APROBADA.');
  }

  const yaExiste = await pool.request().input('id', sql.Int, idPropuesta)
    .query('SELECT idServicio FROM SERVICIO WHERE idPropuesta = @id');
  if (yaExiste.recordset[0]) throw new ApiError(409, 'Esta propuesta ya tiene un servicio asociado.');

  const result = await pool.request()
    .input('idPropuesta', sql.Int, idPropuesta)
    .input('idCliente', sql.Int, propuesta.recordset[0].idCliente)
    .input('nombreServicio', sql.NVarChar(100), nombreServicio)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .input('precio', sql.Decimal(10, 2), precio)
    .input('estado', sql.NVarChar(15), estado || 'ACTIVO')
    .query(`INSERT INTO SERVICIO (idPropuesta, idCliente, nombreServicio, descripcion, precio, estado)
            OUTPUT INSERTED.idServicio
            VALUES (@idPropuesta, @idCliente, @nombreServicio, @descripcion, @precio, @estado)`);
  res.status(201).json({ idServicio: result.recordset[0].idServicio, mensaje: 'Servicio creado correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['nombreServicio', 'precio']);
  const { nombreServicio, descripcion, precio, estado } = req.body;
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nombreServicio', sql.NVarChar(100), nombreServicio)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .input('precio', sql.Decimal(10, 2), precio)
    .input('estado', sql.NVarChar(15), estado || 'ACTIVO')
    .query('UPDATE SERVICIO SET nombreServicio=@nombreServicio, descripcion=@descripcion, precio=@precio, estado=@estado WHERE idServicio=@id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Servicio no encontrado.');
  res.json({ mensaje: 'Servicio actualizado correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM SERVICIO WHERE idServicio = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Servicio no encontrado.');
  res.json({ mensaje: 'Servicio eliminado correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
