const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ESTADOS = ['DISENO', 'DESARROLLO', 'PRUEBAS', 'FINALIZADO'];

const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query('SELECT * FROM PROYECTO ORDER BY fechaLimite');
  res.json(result.recordset);
});

const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const proyecto = await pool.request().input('id', sql.Int, id).query('SELECT * FROM PROYECTO WHERE idProyecto = @id');
  if (!proyecto.recordset[0]) throw new ApiError(404, 'Proyecto no encontrado.');

  const integrantes = await pool.request().input('id', sql.Int, id).query(`
    SELECT i.idIntegrante, i.idUsuario, i.rolProyecto, i.fechaAsignacion, u.nombres, u.apellidos
    FROM INTEGRANTE_PROYECTO i JOIN USUARIO u ON u.idUsuario = i.idUsuario
    WHERE i.idProyecto = @id`);

  res.json({ ...proyecto.recordset[0], integrantes: integrantes.recordset });
});

// RF-04: fecha límite obligatoria
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['nombreProyecto', 'fechaInicio', 'fechaLimite']);
  const { nombreProyecto, descripcion, tipoSolucion, fechaInicio, fechaLimite, estado, repositorio } = req.body;
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('nombreProyecto', sql.NVarChar(120), nombreProyecto)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .input('tipoSolucion', sql.NVarChar(60), tipoSolucion || null)
    .input('fechaInicio', sql.Date, fechaInicio)
    .input('fechaLimite', sql.Date, fechaLimite)
    .input('estado', sql.NVarChar(15), estado || 'DISENO')
    .input('repositorio', sql.NVarChar(255), repositorio || null)
    .query(`INSERT INTO PROYECTO (nombreProyecto, descripcion, tipoSolucion, fechaInicio, fechaLimite, estado, repositorio)
            OUTPUT INSERTED.idProyecto
            VALUES (@nombreProyecto, @descripcion, @tipoSolucion, @fechaInicio, @fechaLimite, @estado, @repositorio)`);
  res.status(201).json({ idProyecto: result.recordset[0].idProyecto, mensaje: 'Proyecto creado correctamente.' });
});

const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['nombreProyecto', 'fechaInicio', 'fechaLimite']);
  const { nombreProyecto, descripcion, tipoSolucion, fechaInicio, fechaLimite, estado, repositorio } = req.body;
  if (estado && !ESTADOS.includes(estado)) throw new ApiError(400, `estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nombreProyecto', sql.NVarChar(120), nombreProyecto)
    .input('descripcion', sql.NVarChar(255), descripcion || null)
    .input('tipoSolucion', sql.NVarChar(60), tipoSolucion || null)
    .input('fechaInicio', sql.Date, fechaInicio)
    .input('fechaLimite', sql.Date, fechaLimite)
    .input('estado', sql.NVarChar(15), estado || 'DISENO')
    .input('repositorio', sql.NVarChar(255), repositorio || null)
    .query(`UPDATE PROYECTO SET nombreProyecto=@nombreProyecto, descripcion=@descripcion, tipoSolucion=@tipoSolucion,
              fechaInicio=@fechaInicio, fechaLimite=@fechaLimite, estado=@estado, repositorio=@repositorio
            WHERE idProyecto=@id`);
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Proyecto no encontrado.');
  res.json({ mensaje: 'Proyecto actualizado correctamente.' });
});

const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM PROYECTO WHERE idProyecto = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Proyecto no encontrado.');
  res.json({ mensaje: 'Proyecto eliminado correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
