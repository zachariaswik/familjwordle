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

import { useStats } from "@features/stats/context/StatsContext"

type GameStatus = "playing" | "won" | "lost"

type GameStateContextValue = {
  state: State
  gameStatus: GameStatus
  isWinRecorded: boolean
  isLossRecorded: boolean
  guessError: string
  elapsedSeconds: number
}

type GameActionsContextValue = {
  handleChange: (input: string) => void
  handleSubmit: () => boolean
  submitWinnerName: (name: string) => void
  submitLoss: () => void
  getKeyboardLetterState: (letter: string) => string
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
  const [state, setState] = useState<State>(() => createState(initialWord))
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing")
  const [winningGuessCount, setWinningGuessCount] = useState<number | null>(
    null,
  )
  const [isWinRecorded, setIsWinRecorded] = useState(false)
  const [isLossRecorded, setIsLossRecorded] = useState(false)
  const [guessError, setGuessError] = useState("")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const startTimeRef = useRef(Date.now())
  const { recordWin, recordLoss } = useStats()

  useEffect(() => {
    setState(createState(initialWord))
    setGameStatus("playing")
    setWinningGuessCount(null)
    setIsWinRecorded(false)
    setIsLossRecorded(false)
    setGuessError("")
    startTimeRef.current = Date.now()
    setElapsedSeconds(0)
  }, [initialWord])

  useEffect(() => {
    if (gameStatus !== "playing") return
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [gameStatus])

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

    if (isWin) {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
      setGameStatus("won")
      setWinningGuessCount(guessCount)
    } else if (isLoss) {
      setGameStatus("lost")
      // recordLoss() is deferred to submitLoss() so PlayPage does not
      // unmount the game component before the Game Over dialog can open.
    }

    return true
  }, [gameStatus, state, validWords])

  const getKeyboardLetterState = useCallback(
    (letter: string) => getLetterState(state, letter),
    [state],
  )

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

      recordWin(trimmedName, state.word, winningGuessCount, elapsedSeconds)
      setIsWinRecorded(true)
    },
    [
      elapsedSeconds,
      gameStatus,
      isWinRecorded,
      recordWin,
      state.word,
      winningGuessCount,
    ],
  )

  const submitLoss = useCallback(() => {
    if (gameStatus !== "lost" || isLossRecorded) return
    recordLoss()
    setIsLossRecorded(true)
  }, [gameStatus, isLossRecorded, recordLoss])

  const stateValue = useMemo(
    () => ({
      state,
      gameStatus,
      isWinRecorded,
      isLossRecorded,
      guessError,
      elapsedSeconds,
    }),
    [
      elapsedSeconds,
      gameStatus,
      guessError,
      isLossRecorded,
      isWinRecorded,
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
    }),
    [
      getKeyboardLetterState,
      handleChange,
      handleSubmit,
      submitLoss,
      submitWinnerName,
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
