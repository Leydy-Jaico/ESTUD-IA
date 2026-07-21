const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, parseId } = require('../utils/validate');

const ROLES = ['ADMINISTRADOR', 'ESTUDIANTE', 'DOCENTE', 'DESARROLLADOR'];

// GET /api/usuarios?rol=ESTUDIANTE
const listar = asyncHandler(async (req, res) => {
  const pool = await poolPromise;
  const request = pool.request();
  let query = `SELECT idUsuario, nombres, apellidos, correo, telefono, rol, fechaRegistro FROM USUARIO`;
  if (req.query.rol) {
    request.input('rol', sql.NVarChar(20), req.query.rol);
    query += ' WHERE rol = @rol';
  }
  query += ' ORDER BY idUsuario';
  const result = await request.query(query);
  res.json(result.recordset);
});

// GET /api/usuarios/:id  -> incluye datos de especialización (ADMINISTRADOR/ESTUDIANTE+APODERADO)
const obtener = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;

  const usuarioResult = await pool
    .request()
    .input('id', sql.Int, id)
    .query('SELECT idUsuario, nombres, apellidos, correo, telefono, rol, fechaRegistro FROM USUARIO WHERE idUsuario = @id');

  const usuario = usuarioResult.recordset[0];
  if (!usuario) throw new ApiError(404, 'Usuario no encontrado.');

  if (usuario.rol === 'ADMINISTRADOR') {
    const admin = await pool.request().input('id', sql.Int, id)
      .query('SELECT cargo, permisos FROM ADMINISTRADOR WHERE idUsuario = @id');
    usuario.administrador = admin.recordset[0] || null;
  }

  if (usuario.rol === 'ESTUDIANTE') {
    const est = await pool.request().input('id', sql.Int, id)
      .query('SELECT dni, idGrupo FROM ESTUDIANTE WHERE idUsuario = @id');
    usuario.estudiante = est.recordset[0] || null;

    const apoderados = await pool.request().input('id', sql.Int, id)
      .query('SELECT idApoderado, nombre, apellidos, parentesco, direccion, celular FROM APODERADO WHERE idEstudiante = @id');
    usuario.apoderados = apoderados.recordset;
  }

  res.json(usuario);
});

// POST /api/usuarios
const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, ['nombres', 'apellidos', 'correo', 'contrasena', 'rol']);
  const { nombres, apellidos, correo, contrasena, telefono, rol } = req.body;

  if (!ROLES.includes(rol)) {
    throw new ApiError(400, `rol inválido. Valores permitidos: ${ROLES.join(', ')}`);
  }

  if (rol === 'ESTUDIANTE') {
    requireFields(req.body, ['dni']);
    requireFields(req.body.apoderado || {}, ['nombre', 'apellidos', 'celular']);
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const hash = await bcrypt.hash(contrasena, 10);

    const usuarioResult = await new sql.Request(transaction)
      .input('nombres', sql.NVarChar(80), nombres)
      .input('apellidos', sql.NVarChar(80), apellidos)
      .input('correo', sql.NVarChar(120), correo)
      .input('contrasena', sql.NVarChar(255), hash)
      .input('telefono', sql.NVarChar(20), telefono || null)
      .input('rol', sql.NVarChar(20), rol)
      .query(`INSERT INTO USUARIO (nombres, apellidos, correo, contrasena, telefono, rol)
              OUTPUT INSERTED.idUsuario
              VALUES (@nombres, @apellidos, @correo, @contrasena, @telefono, @rol)`);

    const idUsuario = usuarioResult.recordset[0].idUsuario;

    if (rol === 'ADMINISTRADOR') {
      await new sql.Request(transaction)
        .input('id', sql.Int, idUsuario)
        .input('cargo', sql.NVarChar(60), req.body.cargo || null)
        .input('permisos', sql.NVarChar(150), req.body.permisos || null)
        .query('INSERT INTO ADMINISTRADOR (idUsuario, cargo, permisos) VALUES (@id, @cargo, @permisos)');
    }

    if (rol === 'ESTUDIANTE') {
      await new sql.Request(transaction)
        .input('id', sql.Int, idUsuario)
        .input('dni', sql.NVarChar(8), req.body.dni)
        .input('idGrupo', sql.Int, req.body.idGrupo || null)
        .query('INSERT INTO ESTUDIANTE (idUsuario, dni, idGrupo) VALUES (@id, @dni, @idGrupo)');

      const ap = req.body.apoderado;
      await new sql.Request(transaction)
        .input('idEstudiante', sql.Int, idUsuario)
        .input('nombre', sql.NVarChar(80), ap.nombre)
        .input('apellidos', sql.NVarChar(80), ap.apellidos)
        .input('parentesco', sql.NVarChar(30), ap.parentesco || null)
        .input('direccion', sql.NVarChar(150), ap.direccion || null)
        .input('celular', sql.NVarChar(20), ap.celular)
        .query(`INSERT INTO APODERADO (idEstudiante, nombre, apellidos, parentesco, direccion, celular)
                VALUES (@idEstudiante, @nombre, @apellidos, @parentesco, @direccion, @celular)`);
    }

    await transaction.commit();
    res.status(201).json({ idUsuario, mensaje: 'Usuario creado correctamente.' });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
});

// PUT /api/usuarios/:id
const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  requireFields(req.body, ['nombres', 'apellidos', 'correo']);
  const { nombres, apellidos, correo, telefono, contrasena } = req.body;

  const pool = await poolPromise;

  let query = `UPDATE USUARIO SET nombres = @nombres, apellidos = @apellidos, correo = @correo, telefono = @telefono`;
  const request = pool
    .request()
    .input('id', sql.Int, id)
    .input('nombres', sql.NVarChar(80), nombres)
    .input('apellidos', sql.NVarChar(80), apellidos)
    .input('correo', sql.NVarChar(120), correo)
    .input('telefono', sql.NVarChar(20), telefono || null);

  if (contrasena) {
    const hash = await bcrypt.hash(contrasena, 10);
    query += ', contrasena = @contrasena';
    request.input('contrasena', sql.NVarChar(255), hash);
  }
  query += ' WHERE idUsuario = @id';

  const result = await request.query(query);
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Usuario no encontrado.');

  if (req.body.idGrupo !== undefined) {
    await pool.request()
      .input('id', sql.Int, id)
      .input('idGrupo', sql.Int, req.body.idGrupo || null)
      .query('UPDATE ESTUDIANTE SET idGrupo = @idGrupo WHERE idUsuario = @id');
  }

  res.json({ mensaje: 'Usuario actualizado correctamente.' });
});

// DELETE /api/usuarios/:id
const eliminar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const pool = await poolPromise;
  const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM USUARIO WHERE idUsuario = @id');
  if (result.rowsAffected[0] === 0) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ mensaje: 'Usuario eliminado correctamente.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
