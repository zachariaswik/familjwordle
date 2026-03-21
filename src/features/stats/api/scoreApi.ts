export type ScoreRecord = {
  playerName: string
  word: string
  guesses: number
  date: string
  timeTakenSeconds?: number | null
}

const env = import.meta.env as { VITE_SCORE_API_BASE_URL?: unknown }
const scoreApiBaseUrl =
  typeof env.VITE_SCORE_API_BASE_URL === "string"
    ? env.VITE_SCORE_API_BASE_URL
    : ""

const API_BASE_URL = scoreApiBaseUrl.replace(/\/$/, "")
const SCORES_URL = `${API_BASE_URL}/api/scores`

function isScoreRecord(value: unknown): value is ScoreRecord {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.playerName === "string" &&
    typeof candidate.word === "string" &&
    typeof candidate.guesses === "number" &&
    typeof candidate.date === "string" &&
    (candidate.timeTakenSeconds === undefined ||
      candidate.timeTakenSeconds === null ||
      typeof candidate.timeTakenSeconds === "number")
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

export type PaginatedScores = {
  scores: ScoreRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

function isPaginatedScores(value: unknown): value is PaginatedScores {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    Array.isArray(candidate.scores) &&
    typeof candidate.total === "number" &&
    typeof candidate.page === "number" &&
    typeof candidate.pageSize === "number" &&
    typeof candidate.totalPages === "number"
  )
}

export async function fetchAllTimeScores(
  page: number,
  pageSize: number,
  playerName?: string,
): Promise<PaginatedScores> {
  const playerParam =
    playerName && playerName.trim().length > 0
      ? `&player=${encodeURIComponent(playerName.trim())}`
      : ""
  const url = `${SCORES_URL}?all=true&page=${page}&limit=${pageSize}${playerParam}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `All-time scores request failed with status ${response.status}`,
    )
  }

  const payload = (await response.json()) as unknown
  if (!isPaginatedScores(payload)) {
    throw new Error("All-time scores response shape is invalid")
  }

  payload.scores = payload.scores.filter(isScoreRecord)
  return payload
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
