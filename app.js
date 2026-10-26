require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');

const pagesRouter = require('./routes/pages');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1); // needed for req.ip to reflect the real client behind cPanel's reverse proxy

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  console.warn(
    'WARNING: SESSION_SECRET is not set. Using a random value that changes on every ' +
    'restart — every admin session will be logged out each time the app restarts. ' +
    'Set SESSION_SECRET in .env (e.g. `openssl rand -hex 32`) to fix this.'
  );
}

app.use(session({
  // Default MemoryStore — fine for a single small Node process with one
  // admin user. If this ever runs under a multi-process manager (PM2
  // cluster mode, etc.) or needs sessions to survive a restart, swap in
  // a real store (e.g. connect-mysql-session) instead.
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // requires HTTPS in production
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
}));

app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/', pagesRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Page not found.');
});

// Error handler — catches DB/render failures from the route handlers above
app.use((err, req, res, next) => {
  console.error(err);
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong. Please try again shortly.'
    : `Server error: ${err.message}`;

  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ ok: false, error: message });
  }
  res.status(500).send(message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BinAnalytics server running at http://localhost:${PORT}`);
});

module.exports = app;
