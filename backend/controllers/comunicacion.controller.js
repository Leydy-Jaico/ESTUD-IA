const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const TIPOS = ['CONSULTA', 'ALERTA', 'TICKET_SOPORTE', 'SEGUIMIENTO'];
const ESTADOS = ['ABIERTO', 'ASIGNADO', 'RESUELTO', 'CERRADO'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `
    SELECT c.*, u.nombres AS usuarioNombres, u.apellidos AS usuarioApellidos, cl.ruc, cl.representante
    FROM COMUNICACION c
    LEFT JOIN USUARIO u ON u.idUsuario = c.idUsuario
    LEFT JOIN CLIENTE cl ON cl.idCliente = c.idCliente`;
  const conditions = [];
  if (req.query.tipoComunicacion) {
    request.input('tipoComunicacion', sql.NVarChar(20), req.query.tipoComunicacion);
    conditions.push('c.tipoComunicacion = @tipoComunicacion');
  }
  if (req.query.estado) {
    request.input('estado', sql.NVarChar(15), req.query.estado);
    conditions.push('c.estado = @estado');
  }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY c.fecha DESC';
  const result = await request.query(query);
  res.json(result.recordset);
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['tipoComunicacion']);
  const { idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, estado } = req.body;
  if (!TIPOS.includes(tipoComunicacion)) throw new ApiError(400, `tipoComunicacion inválido. Valores permitidos: ${TIPOS.join(', ')}`);
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);
  if (!idUsuario && !idCliente) throw new ApiError(400, 'Debe indicar idUsuario o idCliente.');

  const pool = await poolPromise;
  const result = await pool.request()
    .input('idUsuario', sql.Int, idUsuario || null)
    .input('idCliente', sql.Int, idCliente || null)
    .input('tipoComunicacion', sql.NVarChar(20), tipoComunicacion)
    .input('asunto', sql.NVarChar(120), asunto || null)
    .input('detalle', sql.NVarChar(255), detalle || null)
    .input('canal', sql.NVarChar(40), canal || null)
    .input('estado', sql.NVarChar(15), estado || 'ABIERTO')
    .query(`INSERT INTO COMUNICACION (idUsuario, idCliente, tipoComunicacion, asunto, detalle, canal, estado)
            OUTPUT INSERTED.idComunicacion
            VALUES (@idUsuario, @idCliente, @tipoComunicacion, @asunto, @detalle, @canal, @estado)`);
  res.status(201).json({ idComunicacion: result.recordset[0].idComunicacion, mensaje: 'Comunicación registrada correctamente.' });
});

const actualizarEstado = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['estado']);
  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const comunicacion = await pool.request().input('id', sql.Int, id).query('SELECT fecha FROM COMUNICACION WHERE idComunicacion = @id');
  if (!comunicacion.recordset[0]) throw new ApiError(404, 'Comunicación no encontrada.');

  // RF-10: control de tiempos de atención — al resolver/cerrar un ticket se calcula el tiempo transcurrido
  let tiempoAtencionHoras = null;
  if (estado === 'RESUELTO' || estado === 'CERRADO') {
    tiempoAtencionHoras = (Date.now() - new Date(comunicacion.recordset[0].fecha).getTime()) / 3600000;
  }

  await pool.request()
    .input('id', sql.Int, id)
    .input('estado', sql.NVarChar(15), estado)
    .input('tiempoAtencionHoras', sql.Decimal(6, 2), tiempoAtencionHoras)
    .query(`UPDATE COMUNICACION SET estado=@estado,
              tiempoAtencionHoras = COALESCE(@tiempoAtencionHoras, tiempoAtencionHoras)
            WHERE idComunicacion=@id`);
  res.json({ mensaje: `Comunicación actualizada a estado ${estado}.` });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM COMUNICACION WHERE idComunicacion = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Comunicación no encontrada.');
  res.json({ mensaje: 'Comunicación eliminada correctamente.' });
});

module.exports = { listar, crear, actualizarEstado, eliminar };
