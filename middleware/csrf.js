const crypto = require('crypto');

/**
 * Minimal session-bound CSRF protection (no external dependency — the
 * popular `csurf` package is deprecated).
 *
 * attachToken: generates a per-session token on first use, exposes it to
 *   every view as `csrfToken` (so forms can embed it in a hidden field).
 *   Mount this before any route that renders a form.
 *
 * verifyToken: rejects POST/PUT/PATCH/DELETE requests whose body._csrf
 *   doesn't match the session's token. Mount this in front of the routes
 *   that actually need protecting (here: everything under /admin).
 */
function attachToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

function verifyToken(req, res, next) {
  const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
  if (SAFE_METHODS.includes(req.method)) return next();

  const submitted = (req.body && req.body._csrf) || req.get('X-CSRF-Token');
  if (!submitted || !req.session.csrfToken || submitted !== req.session.csrfToken) {
    return res.status(403).send('Invalid or missing CSRF token. Go back, refresh the page, and try again.');
  }
  next();
}

module.exports = { attachToken, verifyToken };
