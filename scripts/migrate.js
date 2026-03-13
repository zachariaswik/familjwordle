import pg from "pg"

const { Pool } = pg

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required")
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    process.env.PGSSLMODE === "require" || process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
})

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scores (
      id BIGSERIAL PRIMARY KEY,
      player_name VARCHAR(50) NOT NULL,
      word VARCHAR(5) NOT NULL,
      guesses SMALLINT NOT NULL CHECK (guesses BETWEEN 1 AND 6),
      played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_scores_played_at
    ON scores (played_at DESC);
  `)

  console.log("Migration complete — scores table and index created.")
} catch (error) {
  console.error("Migration failed:", error)
  process.exit(1)
} finally {
  await pool.end()
}
