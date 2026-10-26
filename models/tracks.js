const pool = require('../config/db');

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

  return tracks.map((t) => ({
    ...t,
    features: featuresByTrack[t.id] || [],
  }));
}

module.exports = { getAllTracks };
