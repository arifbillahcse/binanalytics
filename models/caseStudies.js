const pool = require('../config/db');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 140);
}

async function attachTools(cases) {
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
  return cases.map((c) => ({ ...c, tools: toolsByCase[c.id] || [] }));
}

/**
 * Returns all published case studies with their tool chips attached,
 * in display order. Used by the public site.
 */
async function getAllCaseStudies() {
  const [cases] = await pool.query(
    `SELECT id, slug, tag, tag_icon, title, problem, diagnosis, fix, result, is_placeholder
     FROM case_studies
     WHERE is_published = 1
     ORDER BY sort_order ASC`
  );
  return attachTools(cases);
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

// ===== Admin =====

/** Returns every case study (published or not), for the admin list. */
async function getAllCaseStudiesAdmin() {
  const [cases] = await pool.query(
    `SELECT id, slug, tag, tag_icon, title, problem, diagnosis, fix, result,
            is_placeholder, sort_order, is_published
     FROM case_studies
     ORDER BY sort_order ASC`
  );
  return attachTools(cases);
}

async function getCaseStudyByIdAdmin(id) {
  const [rows] = await pool.query(
    `SELECT id, slug, tag, tag_icon, title, problem, diagnosis, fix, result,
            is_placeholder, sort_order, is_published
     FROM case_studies
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const [withTools] = await attachTools([rows[0]]);
  return withTools;
}

async function replaceCaseStudyTools(caseStudyId, tools) {
  await pool.query(`DELETE FROM case_study_tools WHERE case_study_id = ?`, [caseStudyId]);
  const clean = (tools || []).map((t) => t.trim()).filter(Boolean);
  if (clean.length === 0) return;
  const values = clean.map((tool, i) => [caseStudyId, tool, i + 1]);
  await pool.query(
    `INSERT INTO case_study_tools (case_study_id, tool, sort_order) VALUES ?`,
    [values]
  );
}

async function createCaseStudy(data) {
  const slug = data.slug ? slugify(data.slug) : slugify(data.title);
  const [result] = await pool.query(
    `INSERT INTO case_studies
       (slug, tag, tag_icon, title, problem, diagnosis, fix, result, is_placeholder, sort_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      data.tag,
      data.tag_icon,
      data.title,
      data.problem,
      data.diagnosis,
      data.fix,
      data.result,
      data.is_placeholder ? 1 : 0,
      Number(data.sort_order) || 0,
      data.is_published ? 1 : 0,
    ]
  );
  await replaceCaseStudyTools(result.insertId, data.tools);
  return result.insertId;
}

async function updateCaseStudy(id, data) {
  const slug = data.slug ? slugify(data.slug) : slugify(data.title);
  await pool.query(
    `UPDATE case_studies
     SET slug = ?, tag = ?, tag_icon = ?, title = ?, problem = ?, diagnosis = ?,
         fix = ?, result = ?, is_placeholder = ?, sort_order = ?, is_published = ?
     WHERE id = ?`,
    [
      slug,
      data.tag,
      data.tag_icon,
      data.title,
      data.problem,
      data.diagnosis,
      data.fix,
      data.result,
      data.is_placeholder ? 1 : 0,
      Number(data.sort_order) || 0,
      data.is_published ? 1 : 0,
      id,
    ]
  );
  await replaceCaseStudyTools(id, data.tools);
}

async function deleteCaseStudy(id) {
  await pool.query(`DELETE FROM case_studies WHERE id = ?`, [id]);
}

module.exports = {
  getAllCaseStudies,
  getCaseStudyBySlug,
  getAllCaseStudiesAdmin,
  getCaseStudyByIdAdmin,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
};
