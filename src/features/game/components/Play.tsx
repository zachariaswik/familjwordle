import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"

import { useGame } from "../../../contexts/GameContext"
import { useWordDefinition } from "../../../services/useWordService"

import Guesses from "./Guesses"
import Keyboard from "./Keyboard"

const Play: React.FC = () => {
  const {
    state,
    gameStatus,
    isWinRecorded,
    guessError,
    handleChange,
    handleSubmit,
    submitWinnerName,
    getKeyboardLetterState,
  } = useGame()
  const { data: definition, isPending: isDefinitionPending } =
    useWordDefinition(state.word, gameStatus !== "playing")
  const [playerName, setPlayerName] = useState("")
  const [nameError, setNameError] = useState("")

  useEffect(() => {
    if (gameStatus === "playing") {
      setPlayerName("")
      setNameError("")
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

  const handleSaveScore = () => {
    const trimmedName = playerName.trim()
    if (trimmedName.length === 0) {
      setNameError("Please enter your name")
      return
    }

    setNameError("")
    submitWinnerName(trimmedName)
  }

  return (
    <>
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
      {gameStatus === "lost" && (
        <>
          <Typography
            variant="body1"
            color="error"
            sx={{ mt: 2, fontWeight: 600 }}
          >
            Good effort! The right guess is {state.word.toUpperCase()}.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isDefinitionPending
              ? "Loading definition..."
              : (definition ?? "Definition unavailable.")}
          </Typography>
        </>
      )}
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
          <Typography variant="body1" sx={{ mb: 2 }}>
            Correct guess! Well done, the word is {state.word}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isDefinitionPending
              ? "Loading definition..."
              : (definition ?? "Definition unavailable.")}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Your name"
            value={playerName}
            onChange={(event) => {
              setPlayerName(event.target.value)
              if (nameError) {
                setNameError("")
              }
            }}
            error={nameError.length > 0}
            helperText={nameError}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSaveScore()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleSaveScore}>
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
