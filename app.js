require('dotenv').config();

const path = require('path');
const express = require('express');

const pagesRouter = require('./routes/pages');
const apiRouter = require('./routes/api');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1); // needed for req.ip to reflect the real client behind cPanel's reverse proxy

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);
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
