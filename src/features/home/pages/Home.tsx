import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { usePlayerName } from "@features/player/hooks/usePlayerName"

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { name, saveName } = usePlayerName()
  const theme = useTheme()
  const [inputValue, setInputValue] = useState("")

  const handleSaveName = () => {
    if (inputValue.trim()) {
      saveName(inputValue)
    }
  }

  return (
    <>
      <Dialog open={!name} disableEscapeKeyDown>
        <DialogTitle>Welcome! What&apos;s your name?</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Your name"
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveName()
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            disabled={!inputValue.trim()}
            onClick={handleSaveName}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          border: "1px solid",
          borderColor: "primary.light",
          background: `linear-gradient(180deg, rgba(45,212,191,0.08) 0%, ${theme.palette.background.paper} 40%)`,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" color="primary.dark" gutterBottom>
          Welcome, {name}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Guess the hidden word in 6 tries. Each guess must be a valid 5-letter
          word.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          After each guess, tiles change color to show how close your guess was:
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#6aaa64",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              color: "white",
              fontWeight: "bold",
            }}
          >
            G
          </Box>
          <Typography variant="body2" sx={{ alignSelf: "center" }}>
            Green = Correct position
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#c9b458",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              color: "white",
              fontWeight: "bold",
            }}
          >
            Y
          </Box>
          <Typography variant="body2" sx={{ alignSelf: "center" }}>
            Yellow = Right letter, wrong position
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 4 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#787c7e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              color: "white",
              fontWeight: "bold",
            }}
          >
            X
          </Box>
          <Typography variant="body2" sx={{ alignSelf: "center" }}>
            Gray = Not in word
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/play")}
          sx={{ mt: 2, backgroundColor: "primary.main" }}
        >
          Start Playing
        </Button>
      </Paper>
    </>
  )
}

export default Home
