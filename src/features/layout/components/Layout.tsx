import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material"
import { useNavigate, Outlet } from "react-router-dom"

import { useStats } from "@features/stats/context/StatsContext"

const Layout: React.FC = () => {
  const navigate = useNavigate()
  const { gamesPlayed, gamesWon, currentStreak, hasPlayedToday } = useStats()

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(15,118,110,0.1) 0%, rgba(255,255,255,1) 40%)",
      }}
    >
      <AppBar position="static" sx={{ background: "#0f766e" }}>
        <Toolbar>
          <Typography
            variant="h5"
            sx={{ flexGrow: 1, fontWeight: 800, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Wordle
          </Typography>
          {gamesPlayed > 0 && (
            <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
              <Chip
                label={`${gamesWon}W`}
                size="small"
                sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}
              />
              <Chip
                label={`${currentStreak} streak`}
                size="small"
                sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}
              />
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate("/")}
              sx={{ "&:hover": { opacity: 0.8 } }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              disabled={hasPlayedToday}
              onClick={() => navigate("/play")}
              sx={{ "&:hover": { opacity: 0.8 } }}
            >
              Play
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/scoreboard")}
              sx={{ "&:hover": { opacity: 0.8 } }}
            >
              Scoreboard
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/about")}
              sx={{ "&:hover": { opacity: 0.8 } }}
            >
              About
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "#666",
          fontSize: "0.875rem",
          marginTop: "auto",
        }}
      >
        <p>© 2026 Wordle Class Project | Guess the word in 6 tries</p>
      </footer>
    </Box>
  )
}

export default Layout
