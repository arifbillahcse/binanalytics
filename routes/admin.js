const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const requireAdmin = require('../middleware/requireAdmin');
const caseStudiesModel = require('../models/caseStudies');
const faqModel = require('../models/faq');
const tracksModel = require('../models/tracks');
const submissionsModel = require('../models/contactSubmissions');

// ===== AUTH (unprotected) =====

router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', {
    title: 'Admin Login – BinAnalytics',
    error: null,
    next: req.query.next || '/admin',
  });
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const nextUrl = (req.body && req.body.next) || '/admin';

    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedHash = process.env.ADMIN_PASSWORD_HASH;

    if (!expectedUser || !expectedHash) {
      return res.render('admin/login', {
        title: 'Admin Login – BinAnalytics',
        error: 'Admin login is not configured yet (ADMIN_USERNAME / ADMIN_PASSWORD_HASH missing in .env).',
        next: nextUrl,
      });
    }

    const userOk = username === expectedUser;
    // Always run bcrypt.compare, even on a wrong username, so a wrong
    // username and a wrong password take the same amount of time.
    const passOk = await bcrypt.compare(password || '', expectedHash);

    if (!userOk || !passOk) {
      return res.render('admin/login', {
        title: 'Admin Login – BinAnalytics',
        error: 'Incorrect username or password.',
        next: nextUrl,
      });
    }

    req.session.isAdmin = true;
    res.redirect(nextUrl.startsWith('/admin') ? nextUrl : '/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ===== Everything below requires a logged-in session =====
router.use(requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const [cases, faqItems, tracks, submissions] = await Promise.all([
      caseStudiesModel.getAllCaseStudiesAdmin(),
      faqModel.getAllFaqItemsAdmin(),
      tracksModel.getAllTracksAdmin(),
      submissionsModel.getAllSubmissionsAdmin(),
    ]);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard – BinAnalytics',
      active: 'dashboard',
      counts: {
        caseStudies: cases.length,
        faqItems: faqItems.length,
        tracks: tracks.length,
        newSubmissions: submissions.filter((s) => s.status === 'new').length,
        totalSubmissions: submissions.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ===== Case Studies =====

router.get('/case-studies', async (req, res, next) => {
  try {
    const cases = await caseStudiesModel.getAllCaseStudiesAdmin();
    res.render('admin/case-studies/list', { title: 'Case Studies – Admin', active: 'case-studies', cases });
  } catch (err) {
    next(err);
  }
});

router.get('/case-studies/new', (req, res) => {
  res.render('admin/case-studies/form', {
    title: 'New Case Study – Admin',
    active: 'case-studies',
    item: null,
    error: null,
  });
});

router.post('/case-studies', async (req, res, next) => {
  try {
    const data = parseCaseStudyBody(req.body);
    await caseStudiesModel.createCaseStudy(data);
    res.redirect('/admin/case-studies');
  } catch (err) {
    next(err);
  }
});

router.get('/case-studies/:id/edit', async (req, res, next) => {
  try {
    const item = await caseStudiesModel.getCaseStudyByIdAdmin(req.params.id);
    if (!item) return res.status(404).send('Case study not found.');
    res.render('admin/case-studies/form', { title: 'Edit Case Study – Admin', active: 'case-studies', item, error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/case-studies/:id', async (req, res, next) => {
  try {
    const data = parseCaseStudyBody(req.body);
    await caseStudiesModel.updateCaseStudy(req.params.id, data);
    res.redirect('/admin/case-studies');
  } catch (err) {
    next(err);
  }
});

router.post('/case-studies/:id/delete', async (req, res, next) => {
  try {
    await caseStudiesModel.deleteCaseStudy(req.params.id);
    res.redirect('/admin/case-studies');
  } catch (err) {
    next(err);
  }
});

function parseCaseStudyBody(body) {
  return {
    slug: (body.slug || '').trim(),
    tag: (body.tag || '').trim(),
    tag_icon: (body.tag_icon || '').trim(),
    title: (body.title || '').trim(),
    problem: (body.problem || '').trim(),
    diagnosis: (body.diagnosis || '').trim(),
    fix: (body.fix || '').trim(),
    result: (body.result || '').trim(),
    is_placeholder: !!body.is_placeholder,
    sort_order: body.sort_order,
    is_published: !!body.is_published,
    tools: (body.tools || '').split('\n'),
  };
}

// ===== FAQ =====

router.get('/faq', async (req, res, next) => {
  try {
    const items = await faqModel.getAllFaqItemsAdmin();
    res.render('admin/faq/list', { title: 'FAQ – Admin', active: 'faq', items });
  } catch (err) {
    next(err);
  }
});

router.get('/faq/new', (req, res) => {
  res.render('admin/faq/form', {
    title: 'New FAQ Item – Admin',
    active: 'faq',
    item: null,
    categories: faqModel.CATEGORY_ORDER,
    error: null,
  });
});

router.post('/faq', async (req, res, next) => {
  try {
    await faqModel.createFaqItem(parseFaqBody(req.body));
    res.redirect('/admin/faq');
  } catch (err) {
    next(err);
  }
});

router.get('/faq/:id/edit', async (req, res, next) => {
  try {
    const item = await faqModel.getFaqItemByIdAdmin(req.params.id);
    if (!item) return res.status(404).send('FAQ item not found.');
    res.render('admin/faq/form', {
      title: 'Edit FAQ Item – Admin',
      active: 'faq',
      item,
      categories: faqModel.CATEGORY_ORDER,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/faq/:id', async (req, res, next) => {
  try {
    await faqModel.updateFaqItem(req.params.id, parseFaqBody(req.body));
    res.redirect('/admin/faq');
  } catch (err) {
    next(err);
  }
});

router.post('/faq/:id/delete', async (req, res, next) => {
  try {
    await faqModel.deleteFaqItem(req.params.id);
    res.redirect('/admin/faq');
  } catch (err) {
    next(err);
  }
});

function parseFaqBody(body) {
  return {
    category: (body.category || '').trim(),
    question: (body.question || '').trim(),
    answer: (body.answer || '').trim(),
    sort_order: body.sort_order,
    featured_order: body.featured_order,
    is_published: !!body.is_published,
  };
}

// ===== Tracks (fixed set of 3 — edit only) =====

router.get('/tracks', async (req, res, next) => {
  try {
    const tracks = await tracksModel.getAllTracksAdmin();
    res.render('admin/tracks/list', { title: 'Tracks – Admin', active: 'tracks', tracks });
  } catch (err) {
    next(err);
  }
});

router.get('/tracks/:id/edit', async (req, res, next) => {
  try {
    const item = await tracksModel.getTrackByIdAdmin(req.params.id);
    if (!item) return res.status(404).send('Track not found.');
    res.render('admin/tracks/form', { title: 'Edit Track – Admin', active: 'tracks', item, error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/tracks/:id', async (req, res, next) => {
  try {
    const data = {
      letter: (req.body.letter || '').trim(),
      icon: (req.body.icon || '').trim(),
      title: (req.body.title || '').trim(),
      summary: (req.body.summary || '').trim(),
      owner_note: (req.body.owner_note || '').trim(),
      anchor: (req.body.anchor || '').trim(),
      sort_order: req.body.sort_order,
      is_published: !!req.body.is_published,
      features: (req.body.features || '').split('\n'),
    };
    await tracksModel.updateTrack(req.params.id, data);
    res.redirect('/admin/tracks');
  } catch (err) {
    next(err);
  }
});

// ===== Contact Submissions (read-only + status) =====

router.get('/submissions', async (req, res, next) => {
  try {
    const submissions = await submissionsModel.getAllSubmissionsAdmin();
    res.render('admin/submissions/list', { title: 'Submissions – Admin', active: 'submissions', submissions });
  } catch (err) {
    next(err);
  }
});

router.post('/submissions/:id/status', async (req, res, next) => {
  try {
    await submissionsModel.updateSubmissionStatus(req.params.id, req.body.status);
    res.redirect('/admin/submissions');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
