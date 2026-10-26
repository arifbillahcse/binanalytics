const pool = require('../config/db');

/**
 * Returns all published case studies with their tool chips attached,
 * in display order.
 */
async function getAllCaseStudies() {
  const [cases] = await pool.query(
    `SELECT id, slug, tag, tag_icon, title, problem, diagnosis, fix, result, is_placeholder
     FROM case_studies
     WHERE is_published = 1
     ORDER BY sort_order ASC`
  );

  if (cases.length === 0) return [];

  const ids = cases.map((c) => c.id);
  const [tools] = await pool.query(
    `SELECT case_study_id, tool
     FROM case_study_tools
     WHERE case_study_id IN (?)
     ORDER BY sort_order ASC`,
    [ids]
  );

  const toolsByCase = {};
  for (const row of tools) {
    if (!toolsByCase[row.case_study_id]) toolsByCase[row.case_study_id] = [];
    toolsByCase[row.case_study_id].push(row.tool);
  }

  return cases.map((c) => ({
    ...c,
    tools: toolsByCase[c.id] || [],
  }));
}

async function getCaseStudyBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT id, slug, tag, tag_icon, title, problem, diagnosis, fix, result, is_placeholder
     FROM case_studies
     WHERE slug = ? AND is_published = 1
     LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}

module.exports = { getAllCaseStudies, getCaseStudyBySlug };
