const ApiError = require('../utils/ApiError');

// Middleware central de manejo de errores: uniforma códigos HTTP y mensajes
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Violación de restricción UNIQUE / FK en SQL Server
  if (err.number === 2627 || err.number === 2601) {
    return res.status(409).json({ error: 'El registro ya existe o viola una restricción única.' });
  }
  if (err.number === 547) {
    return res.status(409).json({ error: 'La operación viola una restricción de clave foránea o de validación.' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor.' });
}

function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
