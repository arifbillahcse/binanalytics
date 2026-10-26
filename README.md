# BinAnalytics

Express + EJS site with a MySQL-backed admin panel. Case studies, FAQ, and
service tracks are content managed through `/admin` rather than hardcoded
in the templates.

## Stack

- **Server:** Node.js + Express
- **Templates:** EJS (`views/`), shared layout via `views/partials/`
- **Database:** MySQL (schema in `db/schema.sql`, starting content in
  `db/seed.sql`)
- **Admin panel:** session-based auth (`/admin`), CRUD for case studies,
  FAQ, and service tracks; read-only view of contact form submissions
- **Contact form:** WhatsApp deep-link (primary) + a backend POST that
  logs to the database and optionally emails a notification (Nodemailer)

## Local development

```bash
npm install
cp .env.example .env     # then fill in DB_*, and anything else you need
npm run db:setup         # creates tables
npm run db:seed          # loads starting content
npm run admin:hash -- "your-password"   # generates ADMIN_PASSWORD_HASH for .env
npm run dev               # starts the server with auto-reload
```

Visit `http://localhost:3000`. Admin panel: `http://localhost:3000/admin/login`.

## Project layout

```
app.js                  Express entry point
routes/                 pages.js (public site), api.js (contact form), admin.js
models/                 DB query functions, one file per resource
views/                  EJS templates — views/admin/** is the dashboard
public/                 static assets (style.css, admin.css, script.js, images)
db/                     schema.sql, seed.sql, run-sql.js (npm run db:setup/seed)
config/                 db.js (MySQL pool), mailer.js (Nodemailer)
middleware/              requireAdmin.js (session gate for /admin)
```

## Deploying

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full cPanel walkthrough
(Node.js App Manager, MySQL setup, env vars, SSL gotcha, troubleshooting).

`GET /healthz` reports whether the app is up and the database is reachable
— check it first after any deploy.
