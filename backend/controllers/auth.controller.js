const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields } = require('../utils/validate');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ['correo', 'contrasena']);
  const { correo, contrasena } = req.body;

  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('correo', sql.NVarChar(120), correo)
    .query('SELECT idUsuario, nombres, apellidos, correo, contrasena, rol FROM USUARIO WHERE correo = @correo');

  const usuario = result.recordset[0];
  if (!usuario) {
    throw new ApiError(401, 'Credenciales inválidas.');
  }

  const passwordOk = await bcrypt.compare(contrasena, usuario.contrasena).catch(() => false);
  if (!passwordOk) {
    throw new ApiError(401, 'Credenciales inválidas.');
  }

  const token = jwt.sign(
    { idUsuario: usuario.idUsuario, correo: usuario.correo, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    token,
    usuario: {
      idUsuario: usuario.idUsuario,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.rol
    }
  });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('id', sql.Int, req.user.idUsuario)
    .query('SELECT idUsuario, nombres, apellidos, correo, telefono, rol, fechaRegistro FROM USUARIO WHERE idUsuario = @id');

  if (!result.recordset[0]) throw new ApiError(404, 'Usuario no encontrado.');
  res.json(result.recordset[0]);
});

module.exports = { login, me };
