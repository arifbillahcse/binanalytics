const pool = require('../config/db');

// Fixed display order for FAQ categories, matching the current faq.html sections.
const CATEGORY_ORDER = ['General', 'Development', 'Tracking', 'Automation & Ads', 'Working Together'];

/**
 * Returns all published FAQ items grouped by category, in the order
 * the FAQ page renders them: [{ category, items: [...] }, ...]
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
    items: byCategory[category],
  }));
}

module.exports = { getFaqGroupedByCategory };
