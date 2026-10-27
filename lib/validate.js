/**
 * Checks a list of { name, value, max } fields against their DB column
 * limits (db/schema.sql) and returns a human-readable error per
 * violation. Catches it before MySQL does (ER_DATA_TOO_LONG), so the
 * admin gets a friendly re-rendered form instead of a 500.
 */
function checkLength(fields) {
  const errors = [];
  for (const f of fields) {
    if (f.value && f.value.length > f.max) {
      errors.push(`${f.name} must be ${f.max} characters or fewer (currently ${f.value.length}).`);
    }
  }
  return errors;
}

module.exports = { checkLength };
