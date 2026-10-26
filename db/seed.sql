-- BinAnalytics — seed data (Phase 2)
-- Mirrors the content currently hardcoded in the EJS views.
-- Run after db/schema.sql, against an empty database.

-- ===== TRACKS =====

INSERT INTO tracks (track_key, letter, icon, title, summary, owner_note, anchor, sort_order) VALUES
('dev', 'Track A', 'fa-solid fa-code', 'Website Development',
 'Fast, clean Shopify &amp; WordPress builds designed to convert — and built so tracking drops in without a fight.',
 'Led by me, dev specialist on the build', 'dev', 1),
('tracking', 'Track B', 'fa-solid fa-chart-line', 'Tracking &amp; Analytics',
 'The specialty. Pixel-perfect, deduplicated, server-side tracking that survives iOS and consent changes.',
 'Handled personally by me — my core specialty', 'tracking', 2),
('automation', 'Track C', 'fa-solid fa-robot', 'Automation &amp; Ads',
 'The connective tissue — CRM wiring, automation, and ad management that keeps data flowing to the right place.',
 'Led by me, ads specialist on execution', 'automation', 3);

INSERT INTO track_features (track_id, feature, sort_order) VALUES
((SELECT id FROM tracks WHERE track_key = 'dev'), 'Shopify theme dev &amp; customization', 1),
((SELECT id FROM tracks WHERE track_key = 'dev'), 'WordPress / WooCommerce builds', 2),
((SELECT id FROM tracks WHERE track_key = 'dev'), 'Landing pages &amp; UX design', 3),
((SELECT id FROM tracks WHERE track_key = 'dev'), 'Speed &amp; Core Web Vitals', 4),

((SELECT id FROM tracks WHERE track_key = 'tracking'), 'GA4 &amp; GTM setup', 1),
((SELECT id FROM tracks WHERE track_key = 'tracking'), 'Meta &amp; TikTok pixel + CAPI', 2),
((SELECT id FROM tracks WHERE track_key = 'tracking'), 'Server-side tracking (sGTM)', 3),
((SELECT id FROM tracks WHERE track_key = 'tracking'), 'Offline &amp; ads conversion tracking', 4),

((SELECT id FROM tracks WHERE track_key = 'automation'), 'Zapier, CallRail, Triple Whale', 1),
((SELECT id FROM tracks WHERE track_key = 'automation'), 'CRM setup: GHL, HubSpot, Zoho', 2),
((SELECT id FROM tracks WHERE track_key = 'automation'), 'Meta / TikTok / Google Ads', 3),
((SELECT id FROM tracks WHERE track_key = 'automation'), 'Automated reporting dashboards', 4);

-- ===== CASE STUDIES =====
-- is_placeholder = 1 for all three: these are realistic PLACEHOLDER figures.
-- Replace with real client numbers (and flip is_placeholder to 0) before launch.

INSERT INTO case_studies (slug, tag, tag_icon, title, problem, diagnosis, fix, result, is_placeholder, sort_order) VALUES
(
  'duplicate-purchase-events-shopify',
  'Shopify · DTC', 'fa-brands fa-shopify',
  'Duplicate Purchase events were inflating ROAS by 38%',
  'A Shopify store doing 700k+ monthly visitors reported a ROAS that looked great on paper but didn''t match Shopify''s real revenue.',
  'The Meta Pixel and Conversions API were both firing Purchase with no shared <code>event_id</code>, so every sale was counted twice.',
  'Rebuilt tracking through server-side GTM with a single source of truth and proper <code>event_id</code> deduplication across browser + server.',
  '<strong>Eliminated 38% duplicate purchases</strong> — reporting now matches Shopify to within 1%.',
  1, 1
),
(
  'invisible-phone-leads-wordpress',
  'WordPress · Lead-Gen', 'fa-brands fa-wordpress',
  'Phone leads were invisible — Google Ads was optimizing blind',
  'A service business generated most of its revenue from phone calls, but none of those calls were attributed back to the ads that drove them.',
  'No offline conversion import existed and the GCLID was never captured on the call, so Google Ads couldn''t tie calls to clicks.',
  'Captured GCLID at form/call, piped CallRail &rarr; Zapier &rarr; Google Ads &amp; GA4 offline conversions with qualified-lead status.',
  '<strong>100% of phone leads now attributed</strong> — cost per qualified lead dropped 27% in 6 weeks.',
  1, 2
),
(
  'meta-emq-recovery-ios145',
  'DTC · Post-iOS 14.5', 'fa-brands fa-meta',
  'Meta reporting collapsed after iOS 14.5 signal loss',
  'After iOS 14.5, a DTC brand''s Meta-reported conversions cratered and no longer matched blended revenue — making scaling decisions a guess.',
  'Tracking was browser-pixel only with weak advanced matching, giving an Event Match Quality of just 6.1 and heavy signal loss.',
  'Deployed server-side Meta CAPI with full advanced matching and added Triple Whale for a blended, first-party view of performance.',
  '<strong>EMQ rose 6.1 &rarr; 9.2</strong>, recovering ~32% of previously lost attributed conversions.',
  1, 3
);

INSERT INTO case_study_tools (case_study_id, tool, sort_order) VALUES
((SELECT id FROM case_studies WHERE slug = 'duplicate-purchase-events-shopify'), 'Server GTM', 1),
((SELECT id FROM case_studies WHERE slug = 'duplicate-purchase-events-shopify'), 'Meta CAPI', 2),
((SELECT id FROM case_studies WHERE slug = 'duplicate-purchase-events-shopify'), 'GA4', 3),

((SELECT id FROM case_studies WHERE slug = 'invisible-phone-leads-wordpress'), 'CallRail', 1),
((SELECT id FROM case_studies WHERE slug = 'invisible-phone-leads-wordpress'), 'Zapier', 2),
((SELECT id FROM case_studies WHERE slug = 'invisible-phone-leads-wordpress'), 'Google Ads', 3),

((SELECT id FROM case_studies WHERE slug = 'meta-emq-recovery-ios145'), 'Meta CAPI', 1),
((SELECT id FROM case_studies WHERE slug = 'meta-emq-recovery-ios145'), 'Triple Whale', 2),
((SELECT id FROM case_studies WHERE slug = 'meta-emq-recovery-ios145'), 'sGTM', 3);

-- ===== FAQ =====

INSERT INTO faq_items (category, question, answer, sort_order) VALUES
-- General
('General', 'Is it really just you, or is there a team?',
 'Both. I personally lead and own every project as your single point of contact — but I work with a small team of individual specialists in ads and automation, each an expert in exactly one lane. You''re never routed through a generalist agency; you''re always talking to me.', 1),
('General', 'Do you do both development and tracking, or just one?',
 'Both — personally. I build the site <em>and</em> the tracking myself, so the dataLayer, events, and pixels are designed together instead of bolted on by a second freelancer who doesn''t understand the code. Ads and automation are handled by individual specialists I lead directly.', 2),
('General', 'What size and type of business do you work with?',
 'Mostly e-commerce (Shopify), lead-gen and service businesses (WordPress), and small agencies who need a tracking specialist they can trust. If you''re a technical decision-maker who''s been burned by a dev who didn''t get tracking — or a marketer who didn''t get dev — that''s exactly who this is for.', 3),

-- Development
('Development', 'Do you build on Shopify, WordPress, or both?',
 'Both. Shopify theme development and customization for e-commerce, WordPress/WooCommerce for content and lead-gen sites. I build the front end and the dataLayer together, so tracking drops in cleanly instead of fighting the theme.', 1),
('Development', 'Can you improve the speed of my existing site?',
 'Yes. Core Web Vitals and PageSpeed tuning are part of every build and available as a standalone fix — image handling, script loading, render-blocking resources, and theme bloat are the usual culprits.', 2),
('Development', 'Will the build be mobile-friendly and SEO-ready?',
 'Always. Every build is mobile-first, semantically structured for SEO, and validated across breakpoints before handoff — a fast, clean site is the foundation everything else sits on.', 3),

-- Tracking
('Tracking', 'Can you set up server-side tracking and Meta CAPI?',
 'Yes. Server-side GTM, Meta &amp; TikTok Conversions API, advanced matching, and event deduplication are core to what I do — it''s how tracking survives iOS and consent-driven signal loss.', 1),
('Tracking', 'Will my GA4 data survive iOS and consent changes?',
 'As well as it possibly can. I move critical events server-side, implement Consent Mode correctly, and rely on first-party data so you keep the strongest possible signal within privacy rules.', 2),
('Tracking', 'My reported conversions don''t match my actual sales. Can you fix that?',
 'That''s one of the most common problems I fix. It''s usually duplicate events (pixel + CAPI firing without a shared <code>event_id</code>), missing deduplication, or broken attribution. I audit, find the root cause, and rebuild the event stream so your numbers match reality.', 3),
('Tracking', 'Can you track phone calls and offline conversions?',
 'Yes. I capture GCLID/click IDs, wire up CallRail and offline conversion imports, and push closed revenue back to Google and Meta so the ad platforms optimize toward real sales — not just clicks.', 4),

-- Automation & Ads
('Automation & Ads', 'Which CRMs and automation tools do you work with?',
 'GoHighLevel, HubSpot, and Zoho on the CRM side; Zapier, CallRail, and Triple Whale for automation and attribution. If your stack uses something else, I can almost always wire it in.', 1),
('Automation & Ads', 'Do you manage the ad campaigns too, or just the tracking?',
 'Both are available. Tracking and automation I handle personally; Meta, TikTok, and Google Ads management is run by a dedicated ads specialist I lead directly — so the campaigns and the data feeding them are always in sync.', 2),
('Automation & Ads', 'Can you automate my reporting?',
 'Yes. I build Looker Studio dashboards that pull from GA4 and the ad platforms and refresh themselves — so your numbers are always current without anyone touching a spreadsheet.', 3),

-- Working Together
('Working Together', 'Do I keep ownership of all accounts and code?',
 'Always. Every GA4 property, ad account, GTM container, pixel, and line of code is set up under your ownership. You''re never locked in or held hostage — the handoff pack includes everything.', 1),
('Working Together', 'How long does a typical project take?',
 'A focused tracking fix can be days; a full build with tracking and automation is usually a couple of weeks. You get a scoped timeline up front before any work starts — no open-ended surprises.', 2),
('Working Together', 'How do we work together and communicate?',
 'Directly — WhatsApp, email, or calls, with me as your one point of contact throughout. You approve a spec before I build, get a QA walkthrough when it''s done, and can reach me after launch — regardless of which specialist worked on which piece.', 3),
('Working Together', 'How is verification handled — how do I know it actually works?',
 'Nothing is "done" until it''s proven. Every event is validated in GA4 DebugView and Tag Assistant with real test transactions, and you get a QA walkthrough (often a short video) plus a verification report before handoff.', 4);

-- Curated subset shown in the condensed FAQ section on the homepage,
-- in the order it should display there (distinct from the full,
-- categorized list on faq.html).
UPDATE faq_items SET featured_order = 1 WHERE question = 'Do you do both development and tracking, or just one?';
UPDATE faq_items SET featured_order = 2 WHERE question = 'Can you set up server-side tracking and Meta CAPI?';
UPDATE faq_items SET featured_order = 3 WHERE question = 'Will my GA4 data survive iOS and consent changes?';
UPDATE faq_items SET featured_order = 4 WHERE question = 'Do I keep ownership of all accounts and code?';
UPDATE faq_items SET featured_order = 5 WHERE question = 'Which CRMs and automation tools do you work with?';
UPDATE faq_items SET featured_order = 6 WHERE question = 'Is it really just you, or is there a team?';
UPDATE faq_items SET featured_order = 7 WHERE question = 'How do we work together and communicate?';
