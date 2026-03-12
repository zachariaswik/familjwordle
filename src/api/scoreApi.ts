export type ScoreRecord = {
  playerName: string
  word: string
  guesses: number
  date: string
}

const API_BASE_URL = (import.meta.env.VITE_SCORE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
)
const SCORES_URL = `${API_BASE_URL}/api/scores`

function isScoreRecord(value: unknown): value is ScoreRecord {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Partial<ScoreRecord>
  return (
    typeof candidate.playerName === "string" &&
    typeof candidate.word === "string" &&
    typeof candidate.guesses === "number" &&
    typeof candidate.date === "string"
  )
}

export async function fetchScores(): Promise<ScoreRecord[]> {
  const response = await fetch(SCORES_URL)
  if (!response.ok) {
    throw new Error(`Score list request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as unknown
  if (!Array.isArray(payload)) {
    throw new Error("Score list response shape is invalid")
  }

  const normalized = payload.filter(isScoreRecord)
  normalized.sort((a, b) => b.date.localeCompare(a.date))
  return normalized
}

export async function saveScore(record: ScoreRecord): Promise<ScoreRecord> {
  const response = await fetch(SCORES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  })

  if (!response.ok) {
    throw new Error(`Score save request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as unknown
  if (!isScoreRecord(payload)) {
    throw new Error("Score save response shape is invalid")
  }

  return payload
}