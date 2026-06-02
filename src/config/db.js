/* Conexión a la base de datos (pool de MariaDB). */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:            process.env.DB_HOST,
  user:            process.env.DB_USER,
  password:        process.env.DB_PASSWORD,
  database:        process.env.DB_DATABASE,
  port:            process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  // Devolver las fechas como texto (ej '2026-05-27')
  dateStrings: true,
});

// Verificación de conexión al arrancar
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log('✅ Conexión exitosa a MariaDB (pladiex_local).');
  } catch (err) {
    console.error('❌ Error crítico al conectar a MariaDB:', err.message);
  }
})();

module.exports = pool;
