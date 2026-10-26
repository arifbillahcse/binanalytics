const pool = require('../config/db');

// Fixed display order for FAQ categories, matching the current faq.html sections.
const CATEGORY_ORDER = ['General', 'Development', 'Tracking', 'Automation & Ads', 'Working Together'];

// Presentational chrome per category (badge/heading/subtitle) — this is page
// layout, not content, so it stays in code rather than the faq_items table.
const CATEGORY_META = {
  General: {
    badge: 'General',
    heading: 'The <span class="highlight">Basics</span>',
    subtitle: "Who you're hiring and how the one-lead-plus-specialists model works.",
  },
  Development: {
    badge: 'Track A · Development',
    heading: 'Website <span class="highlight">Development</span>',
    subtitle: 'Shopify, WordPress, and building things that convert.',
  },
  Tracking: {
    badge: 'Track B · Tracking',
    heading: 'Tracking &amp; <span class="highlight">Analytics</span>',
    subtitle: 'The specialty — GA4, server-side, CAPI, and surviving signal loss.',
  },
  'Automation & Ads': {
    badge: 'Track C · Automation',
    heading: 'Automation &amp; <span class="highlight">Ads</span>',
    subtitle: 'CRMs, workflows, and the ad management that data feeds.',
  },
  'Working Together': {
    badge: 'Working Together',
    heading: 'Ownership, Timelines &amp; <span class="highlight">Communication</span>',
    subtitle: 'How a project actually runs from first message to handoff.',
  },
};

const DEFAULT_META = (category) => ({
  badge: category,
  heading: category,
  subtitle: '',
});

/**
 * Returns all published FAQ items grouped by category, in the order
 * the FAQ page renders them: [{ category, badge, heading, subtitle, items }, ...]
 */
async function getFaqGroupedByCategory() {
  const [rows] = await pool.query(
    `SELECT id, category, question, answer
     FROM faq_items
     WHERE is_published = 1
     ORDER BY category ASC, sort_order ASC`
  );

  const byCategory = {};
  for (const row of rows) {
    if (!byCategory[row.category]) byCategory[row.category] = [];
    byCategory[row.category].push(row);
  }

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return orderedCategories.map((category) => ({
    category,
    ...(CATEGORY_META[category] || DEFAULT_META(category)),
    items: byCategory[category],
  }));
}

/**
 * Returns the curated subset of FAQ items shown in the condensed FAQ
 * section on the homepage, in their featured_order.
 */
async function getFeaturedFaqItems() {
  const [rows] = await pool.query(
    `SELECT id, category, question, answer
     FROM faq_items
     WHERE is_published = 1 AND featured_order IS NOT NULL
     ORDER BY featured_order ASC`
  );
  return rows;
}

module.exports = {
  getFaqGroupedByCategory,
  getFeaturedFaqItems,
  CATEGORY_ORDER,
  getAllFaqItemsAdmin,
  getFaqItemByIdAdmin,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
};

// ===== Admin =====

/** Returns every FAQ item (published or not), for the admin list. */
async function getAllFaqItemsAdmin() {
  const [rows] = await pool.query(
    `SELECT id, category, question, answer, sort_order, featured_order, is_published
     FROM faq_items
     ORDER BY category ASC, sort_order ASC`
  );
  return rows;
}

async function getFaqItemByIdAdmin(id) {
  const [rows] = await pool.query(
    `SELECT id, category, question, answer, sort_order, featured_order, is_published
     FROM faq_items
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function createFaqItem(data) {
  const [result] = await pool.query(
    `INSERT INTO faq_items (category, question, answer, sort_order, featured_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.category,
      data.question,
      data.answer,
      Number(data.sort_order) || 0,
      data.featured_order ? Number(data.featured_order) : null,
      data.is_published ? 1 : 0,
    ]
  );
  return result.insertId;
}

async function updateFaqItem(id, data) {
  await pool.query(
    `UPDATE faq_items
     SET category = ?, question = ?, answer = ?, sort_order = ?, featured_order = ?, is_published = ?
     WHERE id = ?`,
    [
      data.category,
      data.question,
      data.answer,
      Number(data.sort_order) || 0,
      data.featured_order ? Number(data.featured_order) : null,
      data.is_published ? 1 : 0,
      id,
    ]
  );
}

async function deleteFaqItem(id) {
  await pool.query(`DELETE FROM faq_items WHERE id = ?`, [id]);
}
