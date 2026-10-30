import { neon } from "@neondatabase/serverless";

const DEFAULT_SETTINGS = {
  clinicName: "Advance Dental Concepts",
  phone: "0332 4625847",
  addressLine: "44 F/1, Block F1, Phase 1",
  city: "Johar Town, Lahore, Pakistan",
  openingHours: "Monday–Saturday · 10:30 am–2:30 pm & 5:45 pm–10:00 pm",
  logoUrl: "",
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

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await query("CREATE TABLE IF NOT EXISTS admin_users (id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, must_change_password BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("CREATE TABLE IF NOT EXISTS site_settings (id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("CREATE TABLE IF NOT EXISTS reviews (id BIGSERIAL PRIMARY KEY, display_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), treatment_slug TEXT NOT NULL, review_text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')), source TEXT NOT NULL DEFAULT 'public', ip_hash TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("CREATE INDEX IF NOT EXISTS reviews_status_created_idx ON reviews(status, created_at DESC)");
      await query("CREATE INDEX IF NOT EXISTS reviews_ip_created_idx ON reviews(ip_hash, created_at DESC)");
      await query("CREATE TABLE IF NOT EXISTS treatment_media (id BIGSERIAL PRIMARY KEY, treatment_slug TEXT NOT NULL, kind TEXT NOT NULL CHECK (kind IN ('image','video')), url TEXT NOT NULL, pathname TEXT NOT NULL, alt_text TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("CREATE INDEX IF NOT EXISTS treatment_media_slug_idx ON treatment_media(treatment_slug, created_at DESC)");
      await query("CREATE TABLE IF NOT EXISTS admin_login_attempts (id BIGSERIAL PRIMARY KEY, ip_hash TEXT NOT NULL, attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
      await query("CREATE INDEX IF NOT EXISTS admin_login_attempts_ip_idx ON admin_login_attempts(ip_hash, attempted_at DESC)");
      await query("INSERT INTO site_settings (id, data) VALUES ('main', $1::jsonb) ON CONFLICT (id) DO NOTHING", [JSON.stringify(DEFAULT_SETTINGS)]);
      const admins = await query<{id:number}>("SELECT id FROM admin_users LIMIT 1");
      const email = process.env.ADMIN_EMAIL;
      const bootstrapHash = process.env.ADMIN_BOOTSTRAP_PASSWORD_HASH;
      if (admins.length === 0 && email && bootstrapHash) {
        await query("INSERT INTO admin_users (email, password_hash, must_change_password) VALUES ($1, $2, TRUE) ON CONFLICT (email) DO NOTHING", [email.toLowerCase(), bootstrapHash]);
      }
    })().catch((error) => {
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

export async function getApprovedReviews(treatmentSlug?: string) {
  try {
    await ensureSchema();
    if (treatmentSlug) {
      return await query("SELECT id, display_name, rating, treatment_slug, review_text, created_at FROM reviews WHERE status = 'approved' AND treatment_slug = $1 ORDER BY created_at DESC LIMIT 12", [treatmentSlug]);
    }
    return await query("SELECT id, display_name, rating, treatment_slug, review_text, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 8");
  } catch {
    return [];
  }
}

export async function getTreatmentMedia(treatmentSlug: string) {
  try {
    await ensureSchema();
    return await query("SELECT id, treatment_slug, kind, url, alt_text, created_at FROM treatment_media WHERE treatment_slug = $1 ORDER BY created_at DESC", [treatmentSlug]);
  } catch {
    return [];
  }
}

export const treatmentSlugs = [
  "teeth-whitening", "clear-aligners", "dental-implants", "root-canal-treatment",
  "veneers", "crowns-bridges", "dental-fillings", "scaling-polishing",
  "wisdom-tooth-extraction", "dental-checkup", "minor-oral-surgery",
  "smile-makeover", "general-dentistry", "oral-surgery"
];
