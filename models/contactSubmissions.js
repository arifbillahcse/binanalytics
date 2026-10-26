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

module.exports = { createSubmission, getAllSubmissionsAdmin, updateSubmissionStatus };

// ===== Admin =====

const VALID_STATUSES = ['new', 'contacted', 'closed'];

async function getAllSubmissionsAdmin() {
  const [rows] = await pool.query(
    `SELECT id, name, email, track_requested, message, status, created_at
     FROM contact_submissions
     ORDER BY created_at DESC`
  );
  return rows;
}

async function updateSubmissionStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  await pool.query(`UPDATE contact_submissions SET status = ? WHERE id = ?`, [status, id]);
}
