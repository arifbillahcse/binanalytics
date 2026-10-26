#!/usr/bin/env node
/**
 * Runs a .sql file against the configured database.
 * Usage: node db/run-sql.js db/schema.sql
 *        node db/run-sql.js db/seed.sql
 * (also wired up as `npm run db:setup` / `npm run db:seed`)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node db/run-sql.js <path-to-sql-file>');
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), file);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log(`Running ${file} against ${process.env.DB_NAME} @ ${process.env.DB_HOST}...`);
  await connection.query(sql);
  console.log('Done.');
  await connection.end();
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
