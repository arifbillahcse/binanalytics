/**
 * Protects every route mounted after it. Redirects to the login page
 * (with a ?next= return URL) instead of a bare 401, since this guards
 * HTML admin pages, not a JSON API.
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  const next_ = encodeURIComponent(req.originalUrl);
  res.redirect(`/admin/login?next=${next_}`);
}

module.exports = requireAdmin;
