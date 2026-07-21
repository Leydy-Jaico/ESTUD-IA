const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ESTADOS = ['PRESENTE', 'TARDANZA', 'AUSENTE', 'JUSTIFICADO'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `
    SELECT a.*, u.nombres, u.apellidos
    FROM ASISTENCIA a
    JOIN USUARIO u ON u.idUsuario = a.idEstudiante`;
  const conditions = [];
  if (req.query.idSesion) {
    request.input('idSesion', sql.Int, parseId(req.query.idSesion, 'idSesion'));
    conditions.push('a.idSesion = @idSesion');
  }
  if (req.query.idEstudiante) {
    request.input('idEstudiante', sql.Int, parseId(req.query.idEstudiante, 'idEstudiante'));
    conditions.push('a.idEstudiante = @idEstudiante');
  }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY a.fecha DESC';
  const result = await request.query(query);
  res.json(result.recordset);
});

// Registro individual de asistencia por sesión (uno o varios estudiantes)
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idSesion', 'idEstudiante', 'fecha', 'estadoAsistencia']);
  const { idSesion, idEstudiante, fecha, estadoAsistencia, observacion } = req.body;
  if (!ESTADOS.includes(estadoAsistencia)) throw new ApiError(400, `estadoAsistencia inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('idSesion', sql.Int, idSesion)
    .input('idEstudiante', sql.Int, idEstudiante)
    .input('fecha', sql.Date, fecha)
    .input('estadoAsistencia', sql.NVarChar(15), estadoAsistencia)
    .input('observacion', sql.NVarChar(150), observacion || null)
    .query(`INSERT INTO ASISTENCIA (idSesion, idEstudiante, fecha, estadoAsistencia, observacion)
            OUTPUT INSERTED.idAsistencia
            VALUES (@idSesion, @idEstudiante, @fecha, @estadoAsistencia, @observacion)`);
  res.status(201).json({ idAsistencia: result.recordset[0].idAsistencia, mensaje: 'Asistencia registrada correctamente.' });
});

// Registro masivo: [{ idEstudiante, estadoAsistencia, observacion }]
const registrarMasivo = asyncHandler(async (req, res) => {
  const id = parseId(req.params.idSesion, 'idSesion');
  const { fecha, registros } = req.body;
  requireFields(req.body, ['fecha']);
  if (!Array.isArray(registros) || registros.length === 0) {
    throw new ApiError(400, 'Debe enviar un arreglo "registros" con al menos un estudiante.');
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    for (const r of registros) {
      requireFields(r, ['idEstudiante', 'estadoAsistencia']);
      if (!ESTADOS.includes(r.estadoAsistencia)) {
        throw new ApiError(400, `estadoAsistencia inválido para el estudiante ${r.idEstudiante}.`);
      }
      await new sql.Request(transaction)
        .input('idSesion', sql.Int, id)
        .input('idEstudiante', sql.Int, r.idEstudiante)
        .input('fecha', sql.Date, fecha)
        .input('estadoAsistencia', sql.NVarChar(15), r.estadoAsistencia)
        .input('observacion', sql.NVarChar(150), r.observacion || null)
        .query(`INSERT INTO ASISTENCIA (idSesion, idEstudiante, fecha, estadoAsistencia, observacion)
                VALUES (@idSesion, @idEstudiante, @fecha, @estadoAsistencia, @observacion)`);
    }
    await transaction.commit();
    res.status(201).json({ mensaje: `Asistencia registrada para ${registros.length} estudiante(s).` });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['estadoAsistencia']);
  const { estadoAsistencia, observacion } = req.body;
  if (!ESTADOS.includes(estadoAsistencia)) throw new ApiError(400, `estadoAsistencia inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('estadoAsistencia', sql.NVarChar(15), estadoAsistencia)
    .input('observacion', sql.NVarChar(150), observacion || null)
    .query('UPDATE ASISTENCIA SET estadoAsistencia=@estadoAsistencia, observacion=@observacion WHERE idAsistencia=@id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Registro de asistencia no encontrado.');
  res.json({ mensaje: 'Asistencia actualizada correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM ASISTENCIA WHERE idAsistencia = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Registro de asistencia no encontrado.');
  res.json({ mensaje: 'Registro de asistencia eliminado correctamente.' });
});

module.exports = { listar, crear, registrarMasivo, actualizar, eliminar };
