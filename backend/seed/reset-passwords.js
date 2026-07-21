// Hashea con bcrypt la contraseña de los usuarios de prueba insertados por estudia_db.sql
// para que puedan iniciar sesión desde la API. Ejecutar una sola vez luego de cargar la BD:
//   npm run seed:passwords
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('../db');

const PASSWORD_DEMO = 'Estudia2026!';

async function run() {
  const pool = await poolPromise;
  const hash = await bcrypt.hash(PASSWORD_DEMO, 10);

  const usuarios = await pool.request().query('SELECT idUsuario, correo, rol FROM USUARIO');

  for (const u of usuarios.recordset) {
    await pool.request()
      .input('id', sql.Int, u.idUsuario)
      .input('contrasena', sql.NVarChar(255), hash)
      .query('UPDATE USUARIO SET contrasena = @contrasena WHERE idUsuario = @id');
  }

  console.log(`Contraseñas actualizadas para ${usuarios.recordset.length} usuario(s).`);
  console.log(`Contraseña de acceso para todos: ${PASSWORD_DEMO}`);
  usuarios.recordset.forEach((u) => console.log(`  - ${u.correo} (${u.rol})`));
  process.exit(0);
}

run().catch((err) => {
  console.error('Error al actualizar contraseñas:', err.message);
  process.exit(1);
});
