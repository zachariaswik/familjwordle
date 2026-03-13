import cors from "cors"
import express from "express"
import pg from "pg"

const PORT = Number(process.env.PORT ?? 8787)
const DATABASE_URL = process.env.DATABASE_URL
const { Pool } = pg

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required to start the score API")
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    process.env.PGSSLMODE === "require" || process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
})

async function initDb() {
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
}

function normalizeIncomingScore(input) {
  if (typeof input !== "object" || input === null) {
    return null
  }

  const playerName = String(input.playerName ?? "").trim().slice(0, 50)
  const word = String(input.word ?? "").trim().toLowerCase()
  const guesses = Number(input.guesses)
  const date =
    typeof input.date === "string" && input.date.length > 0
      ? input.date
      : new Date().toISOString()

  if (playerName.length === 0) {
    return null
  }

  if (!/^[a-z]{5}$/.test(word)) {
    return null
  }

  if (!Number.isInteger(guesses) || guesses < 1 || guesses > 6) {
    return null
  }

  if (Number.isNaN(Date.parse(date))) {
    return null
  }

  return {
    playerName,
    word,
    guesses,
    date,
  }
}

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1")
    res.status(200).json({ status: "ok" })
  } catch {
    res.status(500).json({ status: "error" })
  }
})

app.get("/api/scores", async (_req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          player_name AS "playerName",
          word,
          guesses,
          played_at AS "date"
        FROM scores
        ORDER BY played_at DESC
      `,
    )

    res.status(200).json(result.rows)
  } catch {
    res.status(500).json({ error: "Unable to load scores" })
  }
})

app.post("/api/scores", async (req, res) => {
  const score = normalizeIncomingScore(req.body)
  if (!score) {
    res.status(400).json({ error: "Invalid score payload" })
    return
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO scores (player_name, word, guesses, played_at)
        VALUES ($1, $2, $3, $4::timestamptz)
        RETURNING
          player_name AS "playerName",
          word,
          guesses,
          played_at AS "date"
      `,
      [score.playerName, score.word, score.guesses, score.date],
    )

    res.status(201).json(result.rows[0])
  } catch {
    res.status(500).json({ error: "Unable to save score" })
  }
})

async function start() {
  await initDb()

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Score API listening on http://localhost:${PORT}`)
  })

  const shutdown = async () => {
    server.close(async () => {
      await pool.end()
      process.exit(0)
    })
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start score API", error)
  process.exit(1)
})
