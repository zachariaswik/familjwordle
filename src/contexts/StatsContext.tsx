import {
  createContext,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react"

export type GameRecord = {
  playerName: string
  word: string
  guesses: number
  date: string
}

type Stats = {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  bestStreak: number
  history: GameRecord[]
  lastPlayDate: string
}

// Set to true to restrict play to once per day
const DAILY_MODE = false

type StatsContextValue = Stats & {
  hasPlayedToday: boolean
  recordWin: (playerName: string, word: string, guesses: number) => void
  recordLoss: () => void
}

const STORAGE_KEY = "wordle-stats"

const defaultStats: Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  history: [],
  lastPlayDate: "",
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadStats(): Stats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Stats>
      const normalizedHistory = (parsed.history ?? []).map((record) => ({
        playerName: record.playerName || "Anonymous",
        word: record.word,
        guesses: record.guesses,
        date: record.date,
      }))

      return { ...defaultStats, ...parsed, history: normalizedHistory }
    }
  } catch {
    // Ignore parse errors
  }
  return defaultStats
}

function saveStats(stats: Stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
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

  const hasPlayedToday = DAILY_MODE && stats.lastPlayDate === getTodayDate()

  const recordWin = (playerName: string, word: string, guesses: number) => {
    setStats((prev) => {
      const newStreak = prev.currentStreak + 1
      const record: GameRecord = {
        playerName,
        word,
        guesses,
        date: new Date().toISOString(),
      }
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
