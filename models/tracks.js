const pool = require('../config/db');

async function attachFeatures(tracks) {
  if (tracks.length === 0) return [];
  const ids = tracks.map((t) => t.id);
  const [features] = await pool.query(
    `SELECT track_id, feature
     FROM track_features
     WHERE track_id IN (?)
     ORDER BY sort_order ASC`,
    [ids]
  );
  const featuresByTrack = {};
  for (const row of features) {
    if (!featuresByTrack[row.track_id]) featuresByTrack[row.track_id] = [];
    featuresByTrack[row.track_id].push(row.feature);
  }
  return tracks.map((t) => ({ ...t, features: featuresByTrack[t.id] || [] }));
}

/**
 * Returns all published tracks, each with its features array attached,
 * ordered the same way the Services page expects (A, B, C).
 */
async function getAllTracks() {
  const [tracks] = await pool.query(
    `SELECT id, track_key, letter, icon, title, summary, owner_note, anchor
     FROM tracks
     WHERE is_published = 1
     ORDER BY sort_order ASC`
  );
  return attachFeatures(tracks);
}

// ===== Admin =====
// Tracks are a fixed set of 3 (dev/tracking/automation) by design — the
// admin panel only supports editing the existing rows, not creating or
// deleting tracks.

async function getAllTracksAdmin() {
  const [tracks] = await pool.query(
    `SELECT id, track_key, letter, icon, title, summary, owner_note, anchor, sort_order, is_published
     FROM tracks
     ORDER BY sort_order ASC`
  );
  return attachFeatures(tracks);
}

async function getTrackByIdAdmin(id) {
  const [rows] = await pool.query(
    `SELECT id, track_key, letter, icon, title, summary, owner_note, anchor, sort_order, is_published
     FROM tracks
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const [withFeatures] = await attachFeatures([rows[0]]);
  return withFeatures;
}

async function replaceTrackFeatures(trackId, features) {
  await pool.query(`DELETE FROM track_features WHERE track_id = ?`, [trackId]);
  const clean = (features || []).map((f) => f.trim()).filter(Boolean);
  if (clean.length === 0) return;
  const values = clean.map((feature, i) => [trackId, feature, i + 1]);
  await pool.query(
    `INSERT INTO track_features (track_id, feature, sort_order) VALUES ?`,
    [values]
  );
}

async function updateTrack(id, data) {
  await pool.query(
    `UPDATE tracks
     SET letter = ?, icon = ?, title = ?, summary = ?, owner_note = ?,
         anchor = ?, sort_order = ?, is_published = ?
     WHERE id = ?`,
    [
      data.letter,
      data.icon,
      data.title,
      data.summary,
      data.owner_note,
      data.anchor,
      Number(data.sort_order) || 0,
      data.is_published ? 1 : 0,
      id,
    ]
  );
  await replaceTrackFeatures(id, data.features);
}

module.exports = {
  getAllTracks,
  getAllTracksAdmin,
  getTrackByIdAdmin,
  updateTrack,
};
