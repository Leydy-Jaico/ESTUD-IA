const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// Verifica el JWT enviado en el header Authorization: Bearer <token>
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Token no proporcionado.'));
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { idUsuario, correo, rol }
    next();
  } catch (err) {
    next(new ApiError(401, 'Token inválido o expirado.'));
  }
}

// Restringe el acceso a los roles indicados (ADMINISTRADOR, DOCENTE, ESTUDIANTE, DESARROLLADOR)
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'No autenticado.'));
    if (roles.length && !roles.includes(req.user.rol)) {
      return next(new ApiError(403, 'No tienes permisos para esta acción.'));
    }
    next();
  };
}

module.exports = { verifyToken, authorize };
