import pool from "./_db.js"

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

  return { playerName, word, guesses, date }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const result = await pool.query(`
        SELECT
          player_name AS "playerName",
          word,
          guesses,
          played_at AS "date"
        FROM scores
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
      return res.status(201).json(result.rows[0])
    } catch {
      return res.status(500).json({ error: "Unable to save score" })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}
