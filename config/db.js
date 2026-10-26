const mysql = require('mysql2/promise');

// cPanel MySQL databases are typically named <cpanel_user>_<dbname> and
// users <cpanel_user>_<dbuser> — set the full prefixed names in .env.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
});

module.exports = pool;
