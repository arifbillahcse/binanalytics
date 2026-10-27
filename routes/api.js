const express = require('express');
const router = express.Router();

const { createSubmission } = require('../models/contactSubmissions');
const { sendContactNotification } = require('../config/mailer');
const { createRateLimiter } = require('../lib/rateLimiter');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 5 submissions per IP per 10 minutes.
const contactLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, track, message, company } = req.body || {};

    // Honeypot: bots fill every field, real visitors never see this one.
    // Respond as if successful so bots don't learn to adapt.
    if (company) {
      return res.json({ ok: true });
    }

    if (contactLimiter.isLimited(req.ip)) {
      return res.status(429).json({ ok: false, error: 'Too many submissions. Please try again later.' });
    }

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();

    if (!trimmedName || !trimmedEmail) {
      return res.status(400).json({ ok: false, error: 'Name and email are required.' });
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
    }
    if (trimmedName.length > 160 || trimmedEmail.length > 200) {
      return res.status(400).json({ ok: false, error: 'Input too long.' });
    }

    const submission = {
      name: trimmedName,
      email: trimmedEmail,
      trackRequested: (track || '').trim().slice(0, 160) || null,
      message: (message || '').trim().slice(0, 5000) || null,
    };

    const id = await createSubmission(submission);

    // Email is best-effort — never fail the request because SMTP isn't
    // configured or a send fails. Log it and move on.
    try {
      await sendContactNotification(submission);
    } catch (mailErr) {
      console.error('Contact notification email failed:', mailErr.message);
    }

    res.json({ ok: true, id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
