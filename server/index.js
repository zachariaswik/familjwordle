import cors from "cors"
import express from "express"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT ?? 8787)
const DATA_DIR = path.join(__dirname, "data")
const DATA_FILE = path.join(DATA_DIR, "scores.json")

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8")
  }
}

function readScores() {
  ensureStore()
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((entry) => {
        return (
          typeof entry?.playerName === "string" &&
          typeof entry?.word === "string" &&
          typeof entry?.guesses === "number" &&
          typeof entry?.date === "string"
        )
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

function writeScores(scores) {
  ensureStore()
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(scores, null, 2)}\n`, "utf8")
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
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    playerName,
    word,
    guesses,
    date,
  }
}

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

app.get("/api/scores", (_req, res) => {
  const scores = readScores().map(({ id, ...record }) => record)
  res.status(200).json(scores)
})

app.post("/api/scores", (req, res) => {
  const score = normalizeIncomingScore(req.body)
  if (!score) {
    res.status(400).json({ error: "Invalid score payload" })
    return
  }

  const scores = readScores()
  scores.push(score)
  scores.sort((a, b) => b.date.localeCompare(a.date))
  writeScores(scores)

  const { id, ...record } = score
  res.status(201).json(record)
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Score API listening on http://localhost:${PORT}`)
})
