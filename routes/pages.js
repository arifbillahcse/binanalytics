const express = require('express');
const router = express.Router();

const { getAllTracks } = require('../models/tracks');
const { getAllCaseStudies } = require('../models/caseStudies');
const { getFaqGroupedByCategory, getFeaturedFaqItems } = require('../models/faq');

router.get(['/', '/index.html'], async (req, res, next) => {
  try {
    const [tracks, caseStudies, homeFaqs] = await Promise.all([
      getAllTracks(),
      getAllCaseStudies(),
      getFeaturedFaqItems(),
    ]);

    res.render('index', {
      title: 'BinAnalytics – Freelance Web Development + Tracking & Analytics',
      description: 'Led personally by one freelancer, backed by a small team of individual specialists in dev, tracking, and ads. Shopify/WordPress builds, GA4 & server-side tracking, and ad automation that ties every click to revenue you can trust.',
      active: 'home',
      waText: 'Hello BinAnalytics! I want to talk about a project.',
      tracks,
      caseStudies,
      homeFaqs,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/services.html', async (req, res, next) => {
  try {
    const tracks = await getAllTracks();

    res.render('services', {
      title: 'Services – BinAnalytics | Web Dev, Tracking & Analytics, Automation & Ads',
      description: 'Three service tracks under one accountable lead: Shopify/WordPress development, GA4 & server-side tracking, and CRM automation + ad management. Dev and tracking fluent in one person.',
      active: 'services',
      waText: 'Hello BinAnalytics! I want to talk about a project.',
      tracks,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/process.html', (req, res) => {
  res.render('process', {
    title: 'Process – BinAnalytics | Our Proven 4-Step Growth System',
    description: 'See how BinAnalytics delivers results — a clear, proven 4-step process: Discovery & Audit, Strategy & Planning, Launch & Execute, and Optimize & Grow.',
    active: 'process',
    waText: 'Hello BinAnalytics! I want to talk about a project.',
  });
});

router.get('/case-studies.html', async (req, res, next) => {
  try {
    const caseStudies = await getAllCaseStudies();

    res.render('case-studies', {
      title: 'Case Studies – BinAnalytics | Real Tracking & Dev Problems, Fixed',
      description: 'Real problems diagnosed and fixed — duplicate purchase events, unattributed phone leads, iOS 14.5 signal loss. Each case follows Problem → Diagnosis → Fix → Result with hard numbers.',
      active: 'work',
      waText: 'Hello BinAnalytics! I saw your case studies and want to talk.',
      caseStudies,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/about.html', (req, res) => {
  res.render('about', {
    title: 'About – BinAnalytics | Led by One Specialist, Backed by a Team',
    description: 'BinAnalytics is led personally by one dev + tracking specialist, backed by a small team of individual experts in ads and automation. One point of contact, real depth per track.',
    active: 'about',
    waText: 'Hello BinAnalytics! I want to talk about a project.',
  });
});

router.get('/faq.html', async (req, res, next) => {
  try {
    const faqGroups = await getFaqGroupedByCategory();

    res.render('faq', {
      title: 'FAQ – BinAnalytics | Technical Questions, Straight Answers',
      description: 'Answers to the technical questions decision-makers actually ask before hiring for development and tracking — dev, GA4 & server-side, automation, ownership, and how we work together.',
      active: 'faq',
      waText: 'Hello BinAnalytics! I have a question.',
      faqGroups,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/contact.html', (req, res) => {
  res.render('contact', {
    title: 'Contact – BinAnalytics | Book a Call About Your Project',
    description: "Tell me what's broken or what you're building. Message me on WhatsApp and I'll reply personally with a straight assessment — no sales pitch, no jargon.",
    active: 'contact',
    waText: 'Hello BinAnalytics! I want to talk about a project.',
  });
});

module.exports = router;
