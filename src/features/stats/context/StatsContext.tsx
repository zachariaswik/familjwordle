import {
  createContext,
  useEffect,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react"

import { fetchScores, saveScore } from "@features/stats/api/scoreApi"

export type GameRecord = {
  playerName: string
  word: string
  guesses: number
  date: string
  timeTakenSeconds?: number | null
}

type Stats = {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  bestStreak: number
  history: GameRecord[]
  lastPlayDate: string
}

// Restricts play to once per day. Disabled automatically in dev mode.
const DAILY_MODE = !import.meta.env.DEV

type StatsContextValue = Stats & {
  hasPlayedToday: boolean
  recordWin: (
    playerName: string,
    word: string,
    guesses: number,
    timeTakenSeconds?: number | null,
  ) => void
  recordLoss: () => void
}

const STATS_STORAGE_KEY = "wordle-stats"
const SCORE_REFRESH_INTERVAL_MS = 15_000

const defaultStats: Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  history: [],
  lastPlayDate: "",
}

function getTodayDate(): string {
  return new Date().toLocaleDateString("sv-SE")
}

function loadStats(): Stats {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Stats>
      // History is always fetched fresh from the backend, never from cache
      return { ...defaultStats, ...parsed, history: [] }
    }
  } catch {
    // Ignore parse errors
  }
  return defaultStats
}

function saveStats(stats: Stats) {
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats))
}

const StatsContext = createContext<StatsContextValue | null>(null)

export const useStats = (): StatsContextValue => {
  const ctx = useContext(StatsContext)
  if (!ctx) {
    throw new Error("useStats must be used within a StatsProvider")
  }
  return ctx
}

export const StatsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<Stats>(loadStats)

  useEffect(() => {
    let isActive = true

    const syncScores = async () => {
      try {
        const history = await fetchScores()
        if (!isActive) {
          return
        }

        setStats((prev) => {
          const updated = { ...prev, history }
          saveStats(updated)
          return updated
        })
      } catch {
        // Ignore backend fetch errors and keep existing local state.
      }
    }

    void syncScores()
    const intervalId = window.setInterval(syncScores, SCORE_REFRESH_INTERVAL_MS)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [])

  const hasPlayedToday = DAILY_MODE && stats.lastPlayDate === getTodayDate()

  const recordWin = (
    playerName: string,
    word: string,
    guesses: number,
    timeTakenSeconds?: number | null,
  ) => {
    const record: GameRecord = {
      playerName,
      word,
      guesses,
      date: new Date().toISOString(),
      timeTakenSeconds,
    }

    setStats((prev) => {
      const newStreak = prev.currentStreak + 1
      const updated: Stats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + 1,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        history: [...prev.history, record],
        lastPlayDate: getTodayDate(),
      }
      saveStats(updated)
      return updated
    })

    void (async () => {
      try {
        await saveScore(record)
        const history = await fetchScores()
        setStats((prev) => {
          const updated = { ...prev, history }
          saveStats(updated)
          return updated
        })
      } catch {
        // Ignore backend save errors and keep optimistic local state.
      }
    })()
  }

  const recordLoss = () => {
    setStats((prev) => {
      const updated: Stats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        currentStreak: 0,
        lastPlayDate: getTodayDate(),
      }
      saveStats(updated)
      return updated
    })
  }

  return (
    <StatsContext.Provider
      value={{ ...stats, hasPlayedToday, recordWin, recordLoss }}
    >
      {children}
    </StatsContext.Provider>
  )
}
