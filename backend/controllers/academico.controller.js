const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { parseId } = require('../utils/validate');

const NOTA_APROBATORIA = 11; // escala 0-20 (sistema educativo peruano)

// Calcula promedio de notas y estado académico de un estudiante
async function calcularEstado(pool, idEstudiante) {
  const estudiante = await pool.request().input('id', sql.Int, idEstudiante)
    .query(`SELECT u.idUsuario, u.nombres, u.apellidos, e.dni, e.idGrupo
            FROM ESTUDIANTE e JOIN USUARIO u ON u.idUsuario = e.idUsuario
            WHERE e.idUsuario = @id`);
  if (!estudiante.recordset[0]) throw new ApiError(404, 'Estudiante no encontrado.');

  const notas = await pool.request().input('id', sql.Int, idEstudiante)
    .query('SELECT nota FROM NOTA WHERE idEstudiante = @id');

  let estado = 'PENDIENTE';
  let promedio = null;
  if (notas.recordset.length > 0) {
    const suma = notas.recordset.reduce((acc, n) => acc + Number(n.nota), 0);
    promedio = Number((suma / notas.recordset.length).toFixed(2));
    estado = promedio >= NOTA_APROBATORIA ? 'APROBADO' : 'REPROBADO';
  }

  return { estudiante: estudiante.recordset[0], promedio, estado, cantidadNotas: notas.recordset.length };
}

// GET /api/academico/:idEstudiante/estado  (RF-09)
const estadoAcademico = asyncHandler(async (req, res) => {
  const idEstudiante = parseId(req.params.idEstudiante, 'idEstudiante');
  const pool = await poolPromise;
  const resultado = await calcularEstado(pool, idEstudiante);
  res.json(resultado);
});

// GET /api/academico/:idEstudiante/certificado  (RF-09)
const emitirCertificado = asyncHandler(async (req, res) => {
  const idEstudiante = parseId(req.params.idEstudiante, 'idEstudiante');
  const pool = await poolPromise;

  const { estudiante, promedio, estado } = await calcularEstado(pool, idEstudiante);

  if (estado !== 'APROBADO') {
    throw new ApiError(400, `No se puede emitir certificado: el estudiante tiene estado académico ${estado}.`);
  }

  const pagosPendientes = await pool.request().input('id', sql.Int, idEstudiante).query(`
    SELECT p.idPago, p.estadoPago
    FROM PAGO p
    JOIN MATRICULA m ON m.idMatricula = p.idMatricula
    WHERE m.idEstudiante = @id AND p.estadoPago <> 'PAGADO'`);

  if (pagosPendientes.recordset.length > 0) {
    throw new ApiError(400, 'No se puede emitir certificado: el estudiante tiene cuotas pendientes o en mora.');
  }

  const codigo = `CERT-${idEstudiante}-${Date.now()}`;

  await pool.request()
    .input('tipoReporte', sql.NVarChar(60), 'CERTIFICADO_DIGITAL')
    .input('generadoPor', sql.Int, req.user.idUsuario)
    .input('archivoReporte', sql.NVarChar(255), `${codigo}.pdf`)
    .query(`INSERT INTO REPORTE (tipoReporte, generadoPor, archivoReporte)
            VALUES (@tipoReporte, @generadoPor, @archivoReporte)`);

  res.json({
    codigo,
    idEstudiante,
    nombres: estudiante.nombres,
    apellidos: estudiante.apellidos,
    dni: estudiante.dni,
    promedio,
    estado,
    fechaEmision: new Date().toISOString(),
    mensaje: 'Certificado digital emitido correctamente.'
  });
});

module.exports = { estadoAcademico, emitirCertificado, calcularEstado };
