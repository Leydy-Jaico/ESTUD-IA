const sql = require('mssql');
require('dotenv').config();
console.log(process.env.DB_SERVER);
console.log(process.env.DB_DATABASE);
const config = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false'
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const pool = new sql.ConnectionPool(config);

// El pool emite 'error' ante caídas de conexiones ya establecidas (ej. la BD se
// reinicia o se recrea). Sin este listener, Node trata el evento como no
// manejado y tumba todo el proceso.
pool.on('error', (err) => {
  console.error('Error en el pool de SQL Server:', err.message);
});

const poolPromise = pool
  .connect()
  .then((connectedPool) => {
    console.log('Conectado a SQL Server:', process.env.DB_DATABASE);
    return connectedPool;
  })
  .catch((err) => {
    console.error('Error al conectar a SQL Server:', err.message);
    throw err;
  });

// Evita que un fallo de conexión inicial tumbe el proceso completo (unhandledRejection);
// los controladores que hagan `await poolPromise` seguirán recibiendo el rechazo normalmente.
poolPromise.catch(() => {});

module.exports = { sql, poolPromise };
