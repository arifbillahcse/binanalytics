#!/usr/bin/env node
/**
 * Generates a bcrypt hash for the admin password.
 * Usage: npm run admin:hash -- "your-password-here"
 * Paste the output into .env as ADMIN_PASSWORD_HASH.
 */
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run admin:hash -- "your-password-here"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log('\nAdd this to your .env as ADMIN_PASSWORD_HASH:\n');
console.log(hash);
console.log('');
