const ApiError = require('./ApiError');

// Verifica que los campos requeridos existan y no sean cadenas vacías
function requireFields(body, fields) {
  const faltantes = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (faltantes.length) {
    throw new ApiError(400, `Faltan campos obligatorios: ${faltantes.join(', ')}`);
  }
}

function parseId(value, name = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `El parámetro ${name} debe ser un entero positivo.`);
  }
  return id;
}

module.exports = { requireFields, parseId };
