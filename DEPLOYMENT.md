# Deploying BinAnalytics to cPanel

This is a Node.js (Express + EJS) app with a MySQL database — not a static
site. cPanel hosts it via **Setup Node.js App**, which runs it behind
Phusion Passenger. You need a hosting plan where your host has actually
enabled Node.js App support (not every shared plan does — check with your
host if the option isn't in cPanel).

---

## 0. What you need before starting

- cPanel access with **Setup Node.js App** visible under Software
- SSH or Terminal access in cPanel (Advanced → Terminal) — you'll run
  `npm install` and the DB setup scripts from there
- A domain or subdomain pointed at the hosting account
- Your admin login password decided (you'll hash it in step 6)

---

## 1. Get the code onto the server

**Option A — Git (recommended):**
In cPanel, go to **Git Version Control** → Create → paste your repo's clone
URL → set the repository path (e.g. `binanalytics`) → Create.

**Option B — manual upload:**
Zip the repo (excluding `node_modules` and `.env` — neither should be
committed, and `node_modules` doesn't need to travel; you'll run
`npm install` on the server instead), upload via File Manager, extract into
a folder under your home directory, e.g. `~/binanalytics`.

Either way, you should end up with a folder like `~/binanalytics`
containing `app.js`, `package.json`, `views/`, `routes/`, etc.

---

## 2. Create the MySQL database

In cPanel → **MySQL® Databases**:

1. Create a database — cPanel will prefix it automatically, e.g.
   `cpaneluser_binanalytics`.
2. Create a database user with a strong password — e.g.
   `cpaneluser_binadmin`.
3. **Add that user to the database** with **All Privileges**.
4. Write down the three full prefixed values (database name, username) and
   the password — you'll need them in step 5.

---

## 3. Set up the Node.js App

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | Latest available 18.x or 20.x (anything ≥ 16, per `package.json`'s `engines`) |
| Application mode | **Production** |
| Application root | `binanalytics` (the folder from step 1, relative to home) |
| Application URL | your domain or subdomain |
| Application startup file | `app.js` |

Click **Create**. cPanel will show you a command like:

```
source /home/<user>/nodevenv/binanalytics/20/bin/activate && cd /home/<user>/binanalytics
```

Keep that — you'll run it in Terminal before any `npm`/`node` command below,
so you're using the Node version cPanel provisioned instead of the system
one.

---

## 4. Install dependencies

In cPanel Terminal:

```bash
source /home/<user>/nodevenv/binanalytics/20/bin/activate && cd /home/<user>/binanalytics
npm install --production
```

(Or use the **Run NPM Install** button on the Setup Node.js App page —
same effect, no Terminal needed.)

---

## 5. Configure environment variables

You have two options — **use cPanel's own env var UI if your host's
Passenger setup reads it reliably; otherwise use a `.env` file**, which this
app supports either way via `dotenv`.

**Easiest: `.env` file.** In Terminal:

```bash
cd ~/binanalytics
cp .env.example .env
nano .env   # or edit via File Manager
```

Fill in:

```
PORT=3000                      # cPanel/Passenger overrides this at runtime — fine to leave
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpaneluser_binanalytics
DB_USER=cpaneluser_binadmin
DB_PASSWORD=<the password from step 2>

SMTP_HOST=                     # see step 8 — can fill in later, email just stays disabled until then
CONTACT_EMAIL_TO=you@yourdomain.com
```

Leave `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` / `SESSION_SECRET` for the
next step.

> **Don't set `NODE_ENV=production` yet if your domain doesn't have SSL
> enabled.** Session cookies are marked `secure` in production, which means
> they're only sent over HTTPS — if you turn this on before SSL is live,
> **admin login will silently fail** (the cookie never gets set). Do step 7
> (SSL) first, or leave `NODE_ENV` unset until it's ready.

---

## 6. Set up the database schema + seed data

Still in the activated Terminal session:

```bash
npm run db:setup   # creates all tables (db/schema.sql)
npm run db:seed    # loads the starting content (db/seed.sql)
```

If this fails with an access-denied error, double-check `DB_NAME`/`DB_USER`
in `.env` match exactly what cPanel generated (including the
`cpaneluser_` prefix) and that the user has All Privileges on that database.

---

## 7. Enable SSL

cPanel → **SSL/TLS Status** (or **AutoSSL**) → run AutoSSL for your domain,
or install a Let's Encrypt cert if your host offers it separately. Confirm
`https://yourdomain.com` loads before continuing — the admin panel depends
on this (see the warning in step 5).

---

## 8. Set up email notifications (optional but recommended)

cPanel → **Email Accounts** → create one (e.g. `noreply@yourdomain.com`).
cPanel will show its SMTP host/port. Add to `.env`:

```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=<that mailbox's password>
MAIL_FROM=noreply@yourdomain.com
CONTACT_EMAIL_TO=you@yourdomain.com
```

If you skip this, the contact form still works and still saves to the
database — you just won't get an email alert, only the DB record (visible
under `/admin/submissions`).

---

## 9. Set up the admin panel login

Still in the activated Terminal:

```bash
npm run admin:hash -- "a-real-password-you-will-remember"
```

Copy the printed hash into `.env`:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<paste the hash here, including the $2a$... prefix>
SESSION_SECRET=<run: openssl rand -hex 32, and paste the result>
```

Now finish `.env` by setting:

```
NODE_ENV=production
```

(assuming SSL from step 7 is live).

---

## 10. Restart the app

cPanel → **Setup Node.js App** → find the app → **Restart**.

(If that button isn't available for some reason, `touch tmp/restart.txt`
inside the app root also tells Passenger to restart it.)

---

## 11. Verify it's actually working

1. Visit `https://yourdomain.com/healthz` — should return
   `{"ok":true,"db":"connected",...}`. If you get `"db":"unreachable"`,
   your `.env` DB credentials are wrong — go back to step 5/6.
2. Visit the homepage — confirm it loads and the case studies / FAQ /
   tracks sections show real content (proves the DB seed worked).
3. Submit the contact form — check it goes to WhatsApp *and* shows up
   under `/admin/submissions`.
4. Visit `/admin/login` and log in with the credentials from step 9.
5. Try editing a case study or FAQ item and confirm it reflects on the
   live site.

---

## Troubleshooting

**App won't start / 503 error**
Check the Node.js App's log (Setup Node.js App → your app → there's usually
a "stderr.log" / log link) or run `node app.js` directly in the activated
Terminal to see the real error.

**"Cannot find module 'express'" (or any package)**
`npm install` wasn't run in the activated virtual environment, or ran
against the wrong Node version. Re-run step 4.

**Changes to `.env` or code don't seem to take effect**
Passenger caches the running process — you must **Restart** the app
(step 10) after any `.env` or code change. A plain file save isn't enough.

**Admin login redirects back to the login page / seems to silently fail**
Almost always the secure-cookie-without-HTTPS issue from step 5. Confirm
SSL is actually active and you're visiting `https://`, not `http://`.

**`db:setup` / `db:seed` fail with "Access denied"**
The DB user in `.env` either doesn't exist, has the wrong password, or
wasn't granted privileges on that specific database — recheck step 2.

---

## Pre-launch checklist

- [ ] `/healthz` returns `"db":"connected"`
- [ ] SSL is active, `NODE_ENV=production` is set
- [ ] Admin login works at `/admin/login`
- [ ] Contact form submission appears in `/admin/submissions` and (if SMTP
      is configured) arrives by email
- [ ] Case study figures — currently seeded as realistic **placeholders**
      (flagged `is_placeholder=1`) — replaced with real client numbers via
      `/admin/case-studies`, or at minimum reviewed
- [ ] Social links in the footer — currently `href="#"` placeholders
      (search the codebase for `TODO: replace "#"`) — updated to real
      LinkedIn/GitHub/Facebook profile URLs
- [ ] `SESSION_SECRET` is a real random value, not left blank
- [ ] `.env` is **not** committed to git (`.gitignore` already covers it —
      just confirm `git status` doesn't show it)
