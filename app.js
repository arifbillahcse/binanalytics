const path = require('path');
const express = require('express');

const pagesRouter = require('./routes/pages');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', pagesRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Page not found.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BinAnalytics server running at http://localhost:${PORT}`);
});

module.exports = app;
