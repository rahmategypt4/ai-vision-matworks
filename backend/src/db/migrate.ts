/**
 * Run once to set up the database schema.
 * Usage: npm run db:migrate
 */
import { getPool, testConnection } from "./connection.js";

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS identifications (
  id            CHAR(36)        NOT NULL PRIMARY KEY,
  session_id    VARCHAR(128)    NOT NULL,
  image_url     TEXT            NULL,
  mime_type     VARCHAR(64)     NOT NULL,
  file_size_bytes INT UNSIGNED  NOT NULL DEFAULT 0,
  name          VARCHAR(255)    NOT NULL,
  brand         VARCHAR(255)    NULL,
  model_series  VARCHAR(255)    NULL,
  product_code  VARCHAR(255)    NULL,
  category      VARCHAR(128)    NOT NULL,
  condition_val ENUM('Baik','Sedang','Rusak') NOT NULL DEFAULT 'Sedang',
  condition_notes TEXT          NOT NULL,
  price_min_idr BIGINT UNSIGNED NOT NULL DEFAULT 0,
  price_max_idr BIGINT UNSIGNED NOT NULL DEFAULT 0,
  description   TEXT            NOT NULL,
  ai_model      VARCHAR(128)    NOT NULL DEFAULT 'gpt-4o',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_session (session_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Adds new columns to a pre-existing `identifications` table (idempotent via information_schema check).
const NEW_COLUMNS: { name: string; ddl: string }[] = [
  { name: "brand", ddl: "ADD COLUMN brand VARCHAR(255) NULL AFTER name" },
  { name: "model_series", ddl: "ADD COLUMN model_series VARCHAR(255) NULL AFTER brand" },
  { name: "product_code", ddl: "ADD COLUMN product_code VARCHAR(255) NULL AFTER model_series" },
];

async function ensureColumns(pool: ReturnType<typeof getPool>): Promise<void> {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'identifications'`
  );
  const existing = new Set(
    (rows as Record<string, unknown>[]).map((r) => String(r.COLUMN_NAME))
  );

  for (const col of NEW_COLUMNS) {
    if (existing.has(col.name)) {
      console.log(`  • column \`${col.name}\` already exists, skipping`);
      continue;
    }
    console.log(`  • adding column \`${col.name}\`...`);
    await pool.query(`ALTER TABLE identifications ${col.ddl}`);
  }
}

async function migrate(): Promise<void> {
  console.log("Connecting to MySQL...");
  await testConnection();
  console.log("Connected. Running migration...");

  const pool = getPool();
  await pool.execute(CREATE_TABLE_SQL);
  await ensureColumns(pool);

  console.log("✅ Table `identifications` ready.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
