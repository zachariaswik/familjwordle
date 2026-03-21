import pool from "./_db.js"

let schemaReady = false

async function ensureSchema() {
  if (schemaReady) {
    return
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS scores (
      id BIGSERIAL PRIMARY KEY,
      player_name VARCHAR(50) NOT NULL,
      word VARCHAR(5) NOT NULL,
      guesses SMALLINT NOT NULL CHECK (guesses BETWEEN 1 AND 6),
      played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      time_taken_seconds INTEGER
    );
  `)

  await pool.query(`
    ALTER TABLE scores ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_scores_played_at
    ON scores (played_at DESC);
  `)

  schemaReady = true
}

function normalizeIncomingScore(input) {
  if (typeof input !== "object" || input === null) {
    return null
  }

  const playerName = String(input.playerName ?? "")
    .trim()
    .slice(0, 50)
  const word = String(input.word ?? "")
    .trim()
    .toLowerCase()
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

  const rawTime = input.timeTakenSeconds
  const timeTakenSeconds =
    rawTime !== undefined && rawTime !== null ? Number(rawTime) : null

  if (
    timeTakenSeconds !== null &&
    (!Number.isInteger(timeTakenSeconds) || timeTakenSeconds < 0)
  ) {
    return null
  }

  return { playerName, word, guesses, date, timeTakenSeconds }
}

export default async function handler(req, res) {
  await ensureSchema()

  if (req.method === "GET") {
    // All-time paginated scores (sorted by ranking, 1-guess entries excluded)
    if (req.query.all === "true") {
      const page = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1)
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit ?? "20", 10) || 20),
      )
      const offset = (page - 1) * pageSize
      const playerFilter =
        typeof req.query.player === "string" &&
        req.query.player.trim().length > 0
          ? req.query.player.trim()
          : null

      try {
        const [dataResult, countResult] = await Promise.all([
          pool.query(
            `
            SELECT
              player_name AS "playerName",
              word,
              guesses,
              played_at AS "date",
              time_taken_seconds AS "timeTakenSeconds"
            FROM scores
            WHERE guesses > 1
              AND ($3::text IS NULL OR player_name ILIKE $3)
            ORDER BY (guesses * 1000 + COALESCE(time_taken_seconds, 999)) ASC,
                     played_at DESC
            LIMIT $1 OFFSET $2
            `,
            [pageSize, offset, playerFilter],
          ),
          pool.query(
            `SELECT COUNT(*)::int AS total FROM scores WHERE guesses > 1
             AND ($1::text IS NULL OR player_name ILIKE $1)`,
            [playerFilter],
          ),
        ])

        const total = countResult.rows[0]?.total ?? 0
        return res.status(200).json({
          scores: dataResult.rows,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        })
      } catch {
        return res.status(500).json({ error: "Unable to load scores" })
      }
    }

    // Today's scores (existing behaviour)
    try {
      const result = await pool.query(`
        SELECT
          player_name AS "playerName",
          word,
          guesses,
          played_at AS "date",
          time_taken_seconds AS "timeTakenSeconds"
        FROM scores
        WHERE (played_at AT TIME ZONE 'Europe/Stockholm')::date
            = (NOW() AT TIME ZONE 'Europe/Stockholm')::date
        ORDER BY played_at DESC
      `)
      return res.status(200).json(result.rows)
    } catch {
      return res.status(500).json({ error: "Unable to load scores" })
    }
  }

  if (req.method === "POST") {
    const score = normalizeIncomingScore(req.body)
    if (!score) {
      return res.status(400).json({ error: "Invalid score payload" })
    }

    try {
      const result = await pool.query(
        `
        INSERT INTO scores (player_name, word, guesses, played_at, time_taken_seconds)
        VALUES ($1, $2, $3, $4::timestamptz, $5)
        RETURNING
          player_name AS "playerName",
          word,
          guesses,
          played_at AS "date",
          time_taken_seconds AS "timeTakenSeconds"
        `,
        [
          score.playerName,
          score.word,
          score.guesses,
          score.date,
          score.timeTakenSeconds,
        ],
      )
      return res.status(201).json(result.rows[0])
    } catch {
      return res.status(500).json({ error: "Unable to save score" })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}
