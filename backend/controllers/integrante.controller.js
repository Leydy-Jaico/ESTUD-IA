const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `
    SELECT i.*, u.nombres, u.apellidos, p.nombreProyecto
    FROM INTEGRANTE_PROYECTO i
    JOIN USUARIO u ON u.idUsuario = i.idUsuario
    JOIN PROYECTO p ON p.idProyecto = i.idProyecto`;
  if (req.query.idProyecto) {
    request.input('idProyecto', sql.Int, parseId(req.query.idProyecto, 'idProyecto'));
    query += ' WHERE i.idProyecto = @idProyecto';
  }
  const result = await request.query(query);
  res.json(result.recordset);
});

// RF-04: equipo de integrantes con rol
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['idUsuario', 'idProyecto']);
  const { idUsuario, idProyecto, rolProyecto } = req.body;
  const pool = await poolPromise;
  const result = await pool.request()
    .input('idUsuario', sql.Int, idUsuario)
    .input('idProyecto', sql.Int, idProyecto)
    .input('rolProyecto', sql.NVarChar(60), rolProyecto || null)
    .query(`INSERT INTO INTEGRANTE_PROYECTO (idUsuario, idProyecto, rolProyecto)
            OUTPUT INSERTED.idIntegrante
            VALUES (@idUsuario, @idProyecto, @rolProyecto)`);
  res.status(201).json({ idIntegrante: result.recordset[0].idIntegrante, mensaje: 'Integrante agregado correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['rolProyecto']);
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('rolProyecto', sql.NVarChar(60), req.body.rolProyecto)
    .query('UPDATE INTEGRANTE_PROYECTO SET rolProyecto=@rolProyecto WHERE idIntegrante=@id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Integrante no encontrado.');
  res.json({ mensaje: 'Integrante actualizado correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM INTEGRANTE_PROYECTO WHERE idIntegrante = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Integrante no encontrado.');
  res.json({ mensaje: 'Integrante eliminado correctamente.' });
});

module.exports = { listar, crear, actualizar, eliminar };
