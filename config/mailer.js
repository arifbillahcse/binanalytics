const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // Not configured — caller should treat email as unavailable and not fail the request over it.
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587/25
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Sends a notification email for a new contact submission.
 * Best-effort: throws on failure so the caller can log it, but the
 * caller should never let this block saving the submission or
 * responding to the visitor.
 */
async function sendContactNotification({ name, email, trackRequested, message }) {
  const t = getTransporter();
  if (!t) {
    throw new Error('Mailer not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) — skipped.');
  }

  const to = process.env.CONTACT_EMAIL_TO || process.env.SMTP_USER;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  const lines = [
    `New contact form submission from BinAnalytics:`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    trackRequested ? `Track requested: ${trackRequested}` : null,
    ``,
    message ? `Message:\n${message}` : '(no message)',
  ].filter((l) => l !== null);

  await t.sendMail({
    from,
    to,
    replyTo: email,
    subject: `New inquiry from ${name} — BinAnalytics contact form`,
    text: lines.join('\n'),
  });
}

module.exports = { sendContactNotification };
