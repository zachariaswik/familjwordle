import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"

import {
  useGameActions,
  useGameState,
} from "@features/game/context/GameContext"
import { usePlayerName } from "@features/player/hooks/usePlayerName"
import { useWordDefinition } from "@features/word/hooks/useWordService"
import { formatTime } from "@shared/lib/formatTime"

import Guesses from "./Guesses"
import Keyboard from "./Keyboard"

const Play: React.FC = () => {
  const { state, gameStatus, isWinRecorded, guessError, elapsedSeconds } =
    useGameState()
  const {
    handleChange,
    handleSubmit,
    submitWinnerName,
    submitLoss,
    getKeyboardLetterState,
  } = useGameActions()
  const { name } = usePlayerName()
  const { data: definition, isPending: isDefinitionPending } =
    useWordDefinition(state.word, gameStatus !== "playing")
  const [lossDialogOpen, setLossDialogOpen] = useState(false)

  useEffect(() => {
    if (gameStatus === "playing") {
      setLossDialogOpen(false)
    } else if (gameStatus === "lost") {
      setLossDialogOpen(true)
    }
  }, [gameStatus])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit()
      } else if (e.key === "Backspace") {
        handleChange("BACKSPACE")
      } else if (/^[a-z]$/i.test(e.key)) {
        handleChange(e.key.toLowerCase())
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleChange, handleSubmit])

  return (
    <>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
        Time: {formatTime(elapsedSeconds)}
      </Typography>
      <Guesses guesses={state.guesses} currentGuess={state.currentGuess} />
      {guessError && (
        <Typography
          variant="body2"
          color="error"
          sx={{ mt: 1, fontWeight: 600 }}
        >
          {guessError}
        </Typography>
      )}
      <Dialog
        open={lossDialogOpen}
        maxWidth="xs"
        fullWidth
        onClose={() => {
          submitLoss()
          setLossDialogOpen(false)
        }}
      >
        <DialogTitle>Game Over</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            The word was <strong>{state.word.toUpperCase()}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {isDefinitionPending
              ? "Loading definition..."
              : (definition ?? "Definition unavailable.")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              submitLoss()
              setLossDialogOpen(false)
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
      {gameStatus === "won" && isWinRecorded && (
        <>
          <Typography
            variant="body1"
            color="success.main"
            sx={{ mt: 2, fontWeight: 600 }}
          >
            Correct guess! Well done, the word is {state.word}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isDefinitionPending
              ? "Loading definition..."
              : (definition ?? "Definition unavailable.")}
          </Typography>
        </>
      )}
      <Dialog
        open={gameStatus === "won" && !isWinRecorded}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>You solved it!</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Correct guess! Well done, the word is {state.word}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Solved in {formatTime(elapsedSeconds)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isDefinitionPending
              ? "Loading definition..."
              : (definition ?? "Definition unavailable.")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Saving score as: <strong>{name}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => submitWinnerName(name)}>
            Save score
          </Button>
        </DialogActions>
      </Dialog>
      <Keyboard
        getState={getKeyboardLetterState}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default Play
