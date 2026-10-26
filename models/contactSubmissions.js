const pool = require('../config/db');

/**
 * Inserts a contact form submission. Used by the Phase 4 contact
 * form backend endpoint.
 */
async function createSubmission({ name, email, trackRequested, message }) {
  const [result] = await pool.query(
    `INSERT INTO contact_submissions (name, email, track_requested, message)
     VALUES (?, ?, ?, ?)`,
    [name, email, trackRequested || null, message || null]
  );
  return result.insertId;
}

module.exports = { createSubmission };
