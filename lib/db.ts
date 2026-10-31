import { neon } from "@neondatabase/serverless";
import { services } from "@/data/services";
import { buildSeedTreatmentMedia } from "@/data/treatment-media";
import { seedClinicReviews } from "@/data/clinic-reviews";

const DEFAULT_SETTINGS = {
  clinicName: "Advance Dental Concepts",
  phone: "0332 4625847",
  addressLine: "44 F/1, Block F1, Phase 1",
  city: "Johar Town, Lahore, Pakistan",
  openingHours: "Monday–Saturday · 10:30 am–2:30 pm & 5:45 pm–10:00 pm",
  logoUrl: "https://advancedentalconcepts.pk/wp-content/uploads/2024/09/Untitled-design-62-e1783416393934-768x154.png",
  googleReviewsUrl: "https://www.google.com/maps/search/?api=1&query=Advance+Dental+Concepts+44F1+Johar+Town+Lahore",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Advance+Dental+Concepts+44F1+Johar+Town+Lahore"
};

let client: ReturnType<typeof neon> | null = null;
let schemaPromise: Promise<void> | null = null;

export function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!client) client = neon(process.env.DATABASE_URL);
  return client;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const sql = getSql();
  return await sql.query(text, params) as T[];
}

async function seedClinicReviewsOnce() {
  const migrationKey = "adc-clinic-reviews-import-v1";
  const applied = await query("SELECT key FROM app_migrations WHERE key = $1 LIMIT 1", [migrationKey]);
  if (applied.length) return;
  const payload = JSON.stringify(seedClinicReviews);
  const inserted = await query<{id:number}>(
    `INSERT INTO reviews (display_name, rating, treatment_slug, review_text, status, source, created_at)
     SELECT seed_data.display_name, seed_data.rating, 'clinic-wide', seed_data.review_text, 'approved', 'clinic', NOW() - (seed_data.age_days::int * INTERVAL '1 day')
     FROM jsonb_to_recordset($1::jsonb) AS seed_data(display_name text, rating integer, review_text text, age_days integer)
     RETURNING id`,
    [payload]
  );
  if (inserted.length !== seedClinicReviews.length) throw new Error("Clinic review import count mismatch.");
  await query("INSERT INTO app_migrations (key) VALUES ($1) ON CONFLICT (key) DO NOTHING", [migrationKey]);
  console.info("ADC clinic reviews imported", { count: inserted.length });
}

async function seedTreatmentMediaOnce() {
  const migrationKey = "adc-treatment-gallery-photo-refresh-v5";
  const applied = await query("SELECT key FROM app_migrations WHERE key = $1 LIMIT 1", [migrationKey]);
  if (applied.length) return;

  const seedRows = buildSeedTreatmentMedia(services);
  const expected = services.length * 5;
  if (seedRows.length !== expected) {
    throw new Error("Treatment gallery seed expected " + expected + " images but received " + seedRows.length + ".");
  }

  // A single JSONB parameter keeps the Neon request small and avoids the
  // oversized 700-parameter VALUES query used by the earlier gallery seed.
  const payload = JSON.stringify(seedRows);
  const inserted = await query<{id:number}>(
    `INSERT INTO treatment_media
       (treatment_slug, kind, url, pathname, alt_text, placement, pair_number, sort_order, is_illustrative, patient_consent_verified)
     SELECT
       seed_data.treatment_slug,
       seed_data.kind,
       seed_data.url,
       seed_data.pathname,
       seed_data.alt_text,
       seed_data.placement,
       seed_data.pair_number,
       seed_data.sort_order,
       seed_data.is_illustrative,
       seed_data.patient_consent_verified
     FROM jsonb_to_recordset($1::jsonb) AS seed_data(
       treatment_slug text,
       kind text,
       url text,
       pathname text,
       alt_text text,
       placement text,
       pair_number smallint,
       sort_order integer,
       is_illustrative boolean,
       patient_consent_verified boolean
     )
     ON CONFLICT (treatment_slug, placement, (COALESCE(pair_number, 0)), url)
     DO UPDATE SET
       pathname = EXCLUDED.pathname,
       alt_text = EXCLUDED.alt_text,
       sort_order = EXCLUDED.sort_order,
       is_illustrative = EXCLUDED.is_illustrative,
       patient_consent_verified = EXCLUDED.patient_consent_verified
     RETURNING id`,
    [payload]
  );

  if (inserted.length !== expected) {
    console.error("ADC gallery seed count mismatch", { expected, inserted: inserted.length });
    throw new Error("Treatment gallery seed did not insert all " + expected + " images.");
  }

  // Remove older seed versions, including the cartoon comparison assets.
  // Uploaded Vercel Blob media uses its own blob pathname and is preserved.
  await query(
    "DELETE FROM treatment_media WHERE pathname LIKE 'seed/%' AND pathname NOT LIKE 'seed/treatment-gallery-v5/%'"
  );
  await query("INSERT INTO app_migrations (key) VALUES ($1) ON CONFLICT (key) DO NOTHING", [migrationKey]);
  console.info("ADC treatment gallery v4 seeded", { services: services.length, images: inserted.length });
}

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await query("CREATE TABLE IF NOT EXISTS admin_users (id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, must_change_password BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("CREATE TABLE IF NOT EXISTS site_settings (id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("CREATE TABLE IF NOT EXISTS reviews (id BIGSERIAL PRIMARY KEY, display_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), treatment_slug TEXT NOT NULL, review_text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')), source TEXT NOT NULL DEFAULT 'public', ip_hash TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS date_label TEXT");
      await query("CREATE INDEX IF NOT EXISTS reviews_status_created_idx ON reviews(status, created_at DESC)");
      await query("CREATE INDEX IF NOT EXISTS reviews_ip_created_idx ON reviews(ip_hash, created_at DESC)");

      await query("CREATE TABLE IF NOT EXISTS treatment_media (id BIGSERIAL PRIMARY KEY, treatment_slug TEXT NOT NULL, kind TEXT NOT NULL CHECK (kind IN ('image','video')), url TEXT NOT NULL, pathname TEXT NOT NULL, alt_text TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("ALTER TABLE treatment_media ADD COLUMN IF NOT EXISTS placement TEXT NOT NULL DEFAULT 'gallery'");
      await query("ALTER TABLE treatment_media ADD COLUMN IF NOT EXISTS pair_number SMALLINT");
      await query("ALTER TABLE treatment_media ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 100");
      await query("ALTER TABLE treatment_media ADD COLUMN IF NOT EXISTS is_illustrative BOOLEAN NOT NULL DEFAULT FALSE");
      await query("ALTER TABLE treatment_media ADD COLUMN IF NOT EXISTS patient_consent_verified BOOLEAN NOT NULL DEFAULT FALSE");
      await query("CREATE INDEX IF NOT EXISTS treatment_media_slug_idx ON treatment_media(treatment_slug, placement, sort_order, created_at DESC)");
      await query("CREATE UNIQUE INDEX IF NOT EXISTS treatment_media_asset_identity_idx ON treatment_media(treatment_slug, placement, COALESCE(pair_number, 0), url)");
      await query("CREATE TABLE IF NOT EXISTS app_migrations (key TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");

      await query("CREATE TABLE IF NOT EXISTS admin_login_attempts (id BIGSERIAL PRIMARY KEY, ip_hash TEXT NOT NULL, attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("CREATE INDEX IF NOT EXISTS admin_login_attempts_ip_idx ON admin_login_attempts(ip_hash, attempted_at DESC)");
      await query("INSERT INTO site_settings (id, data) VALUES ('main', $1::jsonb) ON CONFLICT (id) DO NOTHING", [JSON.stringify(DEFAULT_SETTINGS)]);
      const logoMigration = "adc-default-clinic-logo-v1";
      const logoMigrationApplied = await query("SELECT key FROM app_migrations WHERE key=$1 LIMIT 1", [logoMigration]);
      if (!logoMigrationApplied.length) {
        await query("UPDATE site_settings SET data = jsonb_set(data, '{logoUrl}', to_jsonb($1::text), TRUE), updated_at = NOW() WHERE id='main' AND COALESCE(data->>'logoUrl','')=''", [DEFAULT_SETTINGS.logoUrl]);
        await query("INSERT INTO app_migrations (key) VALUES ($1) ON CONFLICT (key) DO NOTHING", [logoMigration]);
      }
      await seedTreatmentMediaOnce();
      await seedClinicReviewsOnce();
      const dateLabelMigration = "adc-clinic-review-date-labels-v1";
      const dateLabelsApplied = await query("SELECT key FROM app_migrations WHERE key=$1 LIMIT 1", [dateLabelMigration]);
      if (!dateLabelsApplied.length) {
        await query("UPDATE reviews SET date_label = CASE WHEN created_at > NOW() - INTERVAL '45 days' THEN 'a month ago' WHEN created_at > NOW() - INTERVAL '120 days' THEN '2 months ago' ELSE '2 years ago' END WHERE source='clinic' AND date_label IS NULL");
        await query("INSERT INTO app_migrations (key) VALUES ($1) ON CONFLICT (key) DO NOTHING", [dateLabelMigration]);
      }
      const excerptMigration = "adc-clinic-review-visible-excerpts-v1";
      const excerptsApplied = await query("SELECT key FROM app_migrations WHERE key=$1 LIMIT 1", [excerptMigration]);
      if (!excerptsApplied.length) {
        await query("UPDATE reviews SET review_text = 'A reliable, safe and cost-effective solution place …' WHERE source='clinic' AND display_name='Ahmad Kamal' AND review_text='A reliable, safe and cost-effective solution place'");
        await query("INSERT INTO app_migrations (key) VALUES ($1) ON CONFLICT (key) DO NOTHING", [excerptMigration]);
      }

      const admins = await query<{id:number}>("SELECT id FROM admin_users LIMIT 1");
      const email = process.env.ADMIN_EMAIL;
      const bootstrapHash = process.env.ADMIN_BOOTSTRAP_PASSWORD_HASH;
      if (admins.length === 0 && email && bootstrapHash) {
        await query("INSERT INTO admin_users (email, password_hash, must_change_password) VALUES ($1, $2, TRUE) ON CONFLICT (email) DO NOTHING", [email.toLowerCase(), bootstrapHash]);
      }
    })().catch((error) => {
      console.error("ADC schema or treatment-media seed failed", error);
      schemaPromise = null;
      throw error;
    });
  }
  await schemaPromise;
}

export async function getSiteSettings() {
  try {
    await ensureSchema();
    const rows = await query<{data: typeof DEFAULT_SETTINGS}>("SELECT data FROM site_settings WHERE id = 'main' LIMIT 1");
    return { ...DEFAULT_SETTINGS, ...(rows[0]?.data ?? {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getApprovedReviews(_treatmentSlug?: string) {
  try {
    await ensureSchema();
    return await query("SELECT id, display_name, rating, treatment_slug, review_text, source, date_label, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 1000");
  } catch {
    return [];
  }
}

export async function getTreatmentMedia(treatmentSlug: string) {
  try {
    await ensureSchema();
    const rows = await query(
      "SELECT id, treatment_slug, kind, url, alt_text, placement, pair_number, sort_order, is_illustrative, patient_consent_verified, created_at FROM treatment_media WHERE treatment_slug = $1 AND placement IN ('gallery','comparison_before','comparison_after') ORDER BY sort_order ASC, created_at ASC",
      [treatmentSlug]
    );
    return rows;
  } catch (error) {
    console.error("ADC treatment-media read failed", error);
    return [];
  }
}

export const treatmentSlugs = [
  "teeth-whitening", "clear-aligners", "dental-implants", "root-canal-treatment",
  "veneers", "crowns-bridges", "dental-fillings", "scaling-polishing",
  "wisdom-tooth-extraction", "dental-checkup", "minor-oral-surgery",
  "smile-makeover", "general-dentistry", "oral-surgery"
];
