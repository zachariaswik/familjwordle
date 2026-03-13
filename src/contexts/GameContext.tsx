import {
  createContext,
  useContext,
  useEffect,
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
} from "../features/game/domain/logic"

import { useStats } from "./StatsContext"

type GameStatus = "playing" | "won" | "lost"

type GameContextValue = {
  state: State
  gameStatus: GameStatus
  isWinRecorded: boolean
  guessError: string
  handleChange: (input: string) => void
  handleSubmit: () => boolean
  submitWinnerName: (name: string) => void
  getKeyboardLetterState: (letter: string) => string
}

const MAX_GUESSES = 6

const GameContext = createContext<GameContextValue | null>(null)

export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return ctx
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
  const [guessError, setGuessError] = useState("")
  const { recordWin, recordLoss } = useStats()

  useEffect(() => {
    setState(createState(initialWord))
    setGameStatus("playing")
    setWinningGuessCount(null)
    setIsWinRecorded(false)
    setGuessError("")
  }, [initialWord])

  const handleChange = (input: string) => {
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
  }

  const handleSubmit = (): boolean => {
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
      setGameStatus("won")
      setWinningGuessCount(guessCount)
    } else if (isLoss) {
      setGameStatus("lost")
      recordLoss()
    }

    return true
  }

  const getKeyboardLetterState = (letter: string) =>
    getLetterState(state, letter)

  const submitWinnerName = (name: string) => {
    const trimmedName = name.trim()
    if (
      gameStatus !== "won" ||
      isWinRecorded ||
      winningGuessCount === null ||
      trimmedName.length === 0
    ) {
      return
    }

    recordWin(trimmedName, state.word, winningGuessCount)
    setIsWinRecorded(true)
  }

  return (
    <GameContext.Provider
      value={{
        state,
        gameStatus,
        isWinRecorded,
        guessError,
        handleChange,
        handleSubmit,
        submitWinnerName,
        getKeyboardLetterState,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
