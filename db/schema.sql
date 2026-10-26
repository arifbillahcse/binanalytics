-- BinAnalytics — MySQL schema (Phase 2)
-- Compatible with MySQL 5.7+ / 8.0 and MariaDB 10.2+ (cPanel default).
-- Run this once against a fresh database before db/seed.sql.

CREATE TABLE IF NOT EXISTS tracks (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  track_key     VARCHAR(20)   NOT NULL UNIQUE,   -- 'dev' | 'tracking' | 'automation'
  letter        VARCHAR(10)   NOT NULL,          -- 'Track A', 'Track B', 'Track C'
  icon          VARCHAR(60)   NOT NULL,          -- Font Awesome class, e.g. 'fa-solid fa-code'
  title         VARCHAR(120)  NOT NULL,
  summary       TEXT          NOT NULL,
  owner_note    VARCHAR(160)  NOT NULL,          -- "Led by me, dev specialist on the build"
  anchor        VARCHAR(40)   NOT NULL,          -- 'dev' | 'tracking' | 'automation' (services.html#anchor)
  sort_order    SMALLINT      NOT NULL DEFAULT 0,
  is_published  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS track_features (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  track_id      INT UNSIGNED  NOT NULL,
  feature       VARCHAR(160)  NOT NULL,
  sort_order    SMALLINT      NOT NULL DEFAULT 0,
  CONSTRAINT fk_track_features_track
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_studies (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(140)  NOT NULL UNIQUE,
  tag             VARCHAR(80)   NOT NULL,   -- 'Shopify · DTC'
  tag_icon        VARCHAR(60)   NOT NULL,   -- 'fa-brands fa-shopify'
  title           VARCHAR(200)  NOT NULL,
  problem         TEXT          NOT NULL,
  diagnosis       TEXT          NOT NULL,
  fix             TEXT          NOT NULL,
  result          TEXT          NOT NULL,   -- may contain <strong> for the headline figure
  is_placeholder  TINYINT(1)    NOT NULL DEFAULT 1,  -- true until real client data replaces it
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  is_published    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_study_tools (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_study_id   INT UNSIGNED  NOT NULL,
  tool            VARCHAR(80)   NOT NULL,
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  CONSTRAINT fk_case_study_tools_case
    FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faq_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category      VARCHAR(60)   NOT NULL,   -- 'General' | 'Development' | 'Tracking' | 'Automation & Ads' | 'Working Together'
  question      VARCHAR(300)  NOT NULL,
  answer        TEXT          NOT NULL,   -- may contain inline <em>/<code> markup
  sort_order    SMALLINT      NOT NULL DEFAULT 0,
  is_published  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_submissions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(160)  NOT NULL,
  email           VARCHAR(200)  NOT NULL,
  track_requested VARCHAR(160)  NULL,
  message         TEXT          NULL,
  status          ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_case_studies_published_sort ON case_studies (is_published, sort_order);
CREATE INDEX idx_faq_category_sort ON faq_items (category, sort_order);
CREATE INDEX idx_tracks_published_sort ON tracks (is_published, sort_order);
CREATE INDEX idx_contact_status_created ON contact_submissions (status, created_at);
