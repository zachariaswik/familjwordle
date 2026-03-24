import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react"

import {
  type State,
  type Guess,
  checkGuess,
  computeLetterStates,
  createState,
  getLetterState,
} from "@features/game/domain/logic"

import { usePlayerName } from "@features/player/hooks/usePlayerName"
import { useStats } from "@features/stats/context/StatsContext"

type GameStatus = "playing" | "won" | "lost"

export type HintState = {
  position: number
  letter: string
}

// --- Persistence helpers ---

const GAME_STORAGE_KEY = "wordle-game-state"

type PersistedGameState = {
  word: string
  guesses: Guess[]
  gameStatus: GameStatus
  startTime: number
  elapsedSeconds: number
  hintsUsed: number
  hintUsedThisRound: boolean
  revealedHints: HintState[]
  isWinRecorded: boolean
  isLossRecorded: boolean
  winningGuessCount: number | null
}

function loadGameState(word: string): PersistedGameState | null {
  try {
    const stored = localStorage.getItem(GAME_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as PersistedGameState
      if (parsed.word === word) {
        return parsed
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

function saveGameState(state: PersistedGameState): void {
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage-full errors
  }
}

// --- Context types ---

type GameStateContextValue = {
  state: State
  gameStatus: GameStatus
  isWinRecorded: boolean
  isLossRecorded: boolean
  guessError: string
  elapsedSeconds: number
  hintsUsed: number
  hintUsedThisRound: boolean
  revealedHints: HintState[]
}

type GameActionsContextValue = {
  handleChange: (input: string) => void
  handleSubmit: () => boolean
  submitWinnerName: (name: string) => void
  submitLoss: () => void
  getKeyboardLetterState: (letter: string) => string
  useHint: () => void
}

type GameContextValue = GameStateContextValue & GameActionsContextValue

const MAX_GUESSES = 6

const GameStateContext = createContext<GameStateContextValue | null>(null)
const GameActionsContext = createContext<GameActionsContextValue | null>(null)

export const useGameState = (): GameStateContextValue => {
  const ctx = useContext(GameStateContext)
  if (!ctx) {
    throw new Error("useGameState must be used within a GameProvider")
  }
  return ctx
}

export const useGameActions = (): GameActionsContextValue => {
  const ctx = useContext(GameActionsContext)
  if (!ctx) {
    throw new Error("useGameActions must be used within a GameProvider")
  }
  return ctx
}

export const useGame = (): GameContextValue => {
  return {
    ...useGameState(),
    ...useGameActions(),
  }
}

type GameProviderProps = {
  initialWord: string
  validWords: Set<string>
  children: ReactNode
}

export const GameProvider: FC<GameProviderProps> = ({
  initialWord,
  validWords,
  children,
}) => {
  const savedRef = useRef(loadGameState(initialWord))
  const saved = savedRef.current
  const isInitialMountRef = useRef(true)

  const [state, setState] = useState<State>(() =>
    saved
      ? { word: saved.word, guesses: saved.guesses, currentGuess: "" }
      : createState(initialWord),
  )
  const [gameStatus, setGameStatus] = useState<GameStatus>(
    () => saved?.gameStatus ?? "playing",
  )
  const [winningGuessCount, setWinningGuessCount] = useState<number | null>(
    () => saved?.winningGuessCount ?? null,
  )
  const [isWinRecorded, setIsWinRecorded] = useState(
    () => saved?.isWinRecorded ?? false,
  )
  const [isLossRecorded, setIsLossRecorded] = useState(
    () => saved?.isLossRecorded ?? false,
  )
  const [guessError, setGuessError] = useState("")
  const [startTime, setStartTime] = useState(
    () => saved?.startTime ?? Date.now(),
  )
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (!saved) return 0
    if (saved.gameStatus !== "playing") return saved.elapsedSeconds
    return Math.floor((Date.now() - saved.startTime) / 1000)
  })
  const [hintsUsed, setHintsUsed] = useState(() => saved?.hintsUsed ?? 0)
  const [hintUsedThisRound, setHintUsedThisRound] = useState(
    () => saved?.hintUsedThisRound ?? false,
  )
  const [revealedHints, setRevealedHints] = useState<HintState[]>(
    () => saved?.revealedHints ?? [],
  )
  const { recordWin, recordLoss } = useStats()
  const { name: playerName } = usePlayerName()

  // --- Save to localStorage on every persisted-state change ---
  useEffect(() => {
    saveGameState({
      word: state.word,
      guesses: state.guesses,
      gameStatus,
      startTime,
      elapsedSeconds,
      hintsUsed,
      hintUsedThisRound,
      revealedHints,
      isWinRecorded,
      isLossRecorded,
      winningGuessCount,
    })
  }, [
    state.word,
    state.guesses,
    gameStatus,
    startTime,
    elapsedSeconds,
    hintsUsed,
    hintUsedThisRound,
    revealedHints,
    isWinRecorded,
    isLossRecorded,
    winningGuessCount,
  ])

  // --- Reset on word change (skip initial mount — initializers already handled it) ---
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }
    setState(createState(initialWord))
    setGameStatus("playing")
    setWinningGuessCount(null)
    setIsWinRecorded(false)
    setIsLossRecorded(false)
    setGuessError("")
    setStartTime(Date.now())
    setElapsedSeconds(0)
    setHintsUsed(0)
    setHintUsedThisRound(false)
    setRevealedHints([])
  }, [initialWord])

  useEffect(() => {
    if (gameStatus !== "playing") return
    // Set immediately so there's no 1-second delay on restore
    setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [gameStatus, startTime])

  const handleChange = useCallback(
    (input: string) => {
      if (gameStatus !== "playing") return
      setGuessError("")

      setState((prev) => {
        if (input === "BACKSPACE") {
          return { ...prev, currentGuess: prev.currentGuess.slice(0, -1) }
        } else {
          if (prev.currentGuess.length < 5) {
            return {
              ...prev,
              currentGuess: prev.currentGuess + input.toLowerCase(),
            }
          }
          return prev
        }
      })
    },
    [gameStatus],
  )

  const handleSubmit = useCallback((): boolean => {
    if (gameStatus !== "playing") return false
    if (!checkGuess(state, state.currentGuess)) return false

    if (!validWords.has(state.currentGuess)) {
      setGuessError("Not a valid word")
      return false
    }

    if (state.guesses.some((g) => g.text === state.currentGuess)) {
      setGuessError("Already guessed that word")
      return false
    }

    const letterStates = computeLetterStates(state.word, state.currentGuess)
    const newGuess: Guess = {
      text: state.currentGuess,
      letterStates,
    }

    const isWin = state.currentGuess === state.word
    const guessCount = state.guesses.length + 1
    const isLoss = !isWin && guessCount >= MAX_GUESSES

    setState((prev) => ({
      ...prev,
      guesses: [...prev.guesses, newGuess],
      currentGuess: "",
    }))

    // Allow one hint per guess round.
    setHintUsedThisRound(false)

    // Add every newly confirmed-correct position to the hint display.
    setRevealedHints((prev) => {
      const alreadyShown = new Set(prev.map((h) => h.position))
      const newEntries = letterStates
        .map((ls, i) =>
          ls === "correct" ? { position: i, letter: state.word[i] } : null,
        )
        .filter(
          (h): h is HintState => h !== null && !alreadyShown.has(h.position),
        )
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev
    })

    if (isWin) {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
      setGameStatus("won")
      setWinningGuessCount(guessCount)
    } else if (isLoss) {
      setGameStatus("lost")
      // recordLoss() is deferred to submitLoss() so PlayPage does not
      // unmount the game component before the Game Over dialog can open.
    }

    return true
  }, [gameStatus, state, validWords, startTime])

  const getKeyboardLetterState = useCallback(
    (letter: string) => getLetterState(state, letter),
    [state],
  )

  const useHint = useCallback(() => {
    if (hintUsedThisRound || gameStatus !== "playing") return

    // Exclude positions already in the hint display (covers both explicit hints
    // and positions auto-added from correct guesses).
    const alreadyShown = new Set(revealedHints.map((h) => h.position))
    const available = [0, 1, 2, 3, 4].filter((i) => !alreadyShown.has(i))
    if (available.length === 0) return

    const position = available[Math.floor(Math.random() * available.length)]
    const newHint: HintState = { position, letter: state.word[position] }
    setRevealedHints((prev) => [...prev, newHint])
    setHintUsedThisRound(true)
    setHintsUsed((prev) => prev + 1)
  }, [hintUsedThisRound, gameStatus, state.word, revealedHints])

  const submitWinnerName = useCallback(
    (name: string) => {
      const trimmedName = name.trim()
      if (
        gameStatus !== "won" ||
        isWinRecorded ||
        winningGuessCount === null ||
        trimmedName.length === 0
      ) {
        return
      }

      recordWin(
        trimmedName,
        state.word,
        winningGuessCount,
        elapsedSeconds,
        hintsUsed,
      )
      setIsWinRecorded(true)
    },
    [
      elapsedSeconds,
      gameStatus,
      hintsUsed,
      isWinRecorded,
      recordWin,
      state.word,
      winningGuessCount,
    ],
  )

  const submitLoss = useCallback(() => {
    if (gameStatus !== "lost" || isLossRecorded) return
    recordLoss(
      playerName,
      state.word,
      state.guesses.length,
      elapsedSeconds,
      hintsUsed,
    )
    setIsLossRecorded(true)
  }, [
    elapsedSeconds,
    gameStatus,
    hintsUsed,
    isLossRecorded,
    playerName,
    recordLoss,
    state.guesses.length,
    state.word,
  ])

  const stateValue = useMemo(
    () => ({
      state,
      gameStatus,
      isWinRecorded,
      isLossRecorded,
      guessError,
      elapsedSeconds,
      hintsUsed,
      hintUsedThisRound,
      revealedHints,
    }),
    [
      elapsedSeconds,
      gameStatus,
      guessError,
      hintUsedThisRound,
      hintsUsed,
      isLossRecorded,
      isWinRecorded,
      revealedHints,
      state,
    ],
  )

  const actionsValue = useMemo(
    () => ({
      handleChange,
      handleSubmit,
      submitWinnerName,
      submitLoss,
      getKeyboardLetterState,
      useHint,
    }),
    [
      getKeyboardLetterState,
      handleChange,
      handleSubmit,
      submitLoss,
      submitWinnerName,
      useHint,
    ],
  )

  return (
    <GameStateContext.Provider value={stateValue}>
      <GameActionsContext.Provider value={actionsValue}>
        {children}
      </GameActionsContext.Provider>
    </GameStateContext.Provider>
  )
}
