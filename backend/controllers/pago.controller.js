const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const MEDIOS = ['YAPE', 'TRANSFERENCIA', 'EFECTIVO', 'PLIN'];

// Pagos PENDIENTES cuya ventana de verificación de 24h ya venció pasan a EN_MORA
async function actualizarMorosos(pool) {
  await pool.request().query(`
    UPDATE PAGO SET estadoPago = 'EN_MORA'
    WHERE estadoPago = 'PENDIENTE' AND fechaPago < DATEADD(HOUR, -24, SYSDATETIME())`);
}

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  await actualizarMorosos(pool);

  const request = pool.request();
  let query = `
    SELECT p.*, u.nombres, u.apellidos
    FROM PAGO p
    JOIN USUARIO u ON u.idUsuario = p.idUsuario`;
  const conditions = [];
  if (req.query.idMatricula) {
    request.input('idMatricula', sql.Int, parseId(req.query.idMatricula, 'idMatricula'));
    conditions.push('p.idMatricula = @idMatricula');
  }
  if (req.query.idUsuario) {
    request.input('idUsuario', sql.Int, parseId(req.query.idUsuario, 'idUsuario'));
    conditions.push('p.idUsuario = @idUsuario');
  }
  if (req.query.estadoPago) {
    request.input('estadoPago', sql.NVarChar(15), req.query.estadoPago);
    conditions.push('p.estadoPago = @estadoPago');
  }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY p.fechaPago DESC';
  const result = await request.query(query);
  res.json(result.recordset);
});

// RF-06: registrar uno o varios pagos (cuotas) por matrícula, con comprobante
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idUsuario', 'monto', 'medioPago']);
  const { idUsuario, idMatricula, idServicio, monto, medioPago, comprobante } = req.body;
  if (!MEDIOS.includes(medioPago)) throw new ApiError(400, `medioPago inválido. Valores permitidos: ${MEDIOS.join(', ')}`);
  if (!idMatricula && !idServicio) throw new ApiError(400, 'Debe indicar idMatricula o idServicio.');

  const pool = await poolPromise;
  const result = await pool.request()
    .input('idUsuario', sql.Int, idUsuario)
    .input('idMatricula', sql.Int, idMatricula || null)
    .input('idServicio', sql.Int, idServicio || null)
    .input('monto', sql.Decimal(10, 2), monto)
    .input('medioPago', sql.NVarChar(15), medioPago)
    .input('comprobante', sql.NVarChar(255), comprobante || null)
    .query(`INSERT INTO PAGO (idUsuario, idMatricula, idServicio, monto, medioPago, comprobante)
            OUTPUT INSERTED.idPago, INSERTED.fechaPago
            VALUES (@idUsuario, @idMatricula, @idServicio, @monto, @medioPago, @comprobante)`);

  res.status(201).json({
    idPago: result.recordset[0].idPago,
    fechaPago: result.recordset[0].fechaPago,
    mensaje: 'Pago registrado correctamente. Queda pendiente de verificación dentro de las siguientes 24 horas.'
  });
});

// RF-06: verificar el pago dentro de las 24 horas siguientes al registro
const verificar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;

  const pago = await pool.request().input('id', sql.Int, id).query('SELECT fechaPago, estadoPago FROM PAGO WHERE idPago = @id');
  if (!pago.recordset[0]) throw new ApiError(404, 'Pago no encontrado.');
  if (pago.recordset[0].estadoPago === 'PAGADO') throw new ApiError(409, 'Este pago ya fue verificado.');

  const horasTranscurridas = (Date.now() - new Date(pago.recordset[0].fechaPago).getTime()) / 3600000;
  if (horasTranscurridas > 24) {
    await pool.request().input('id', sql.Int, id).query("UPDATE PAGO SET estadoPago = 'EN_MORA' WHERE idPago = @id");
    throw new ApiError(400, 'No se puede verificar: han transcurrido más de 24 horas desde el registro del pago. El pago quedó marcado EN_MORA.');
  }

  await pool.request().input('id', sql.Int, id)
    .query("UPDATE PAGO SET estadoPago = 'PAGADO', fechaVerificacion = SYSDATETIME() WHERE idPago = @id");
  res.json({ mensaje: 'Pago verificado correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM PAGO WHERE idPago = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Pago no encontrado.');
  res.json({ mensaje: 'Pago eliminado correctamente.' });
});

module.exports = { listar, crear, verificar, eliminar };
