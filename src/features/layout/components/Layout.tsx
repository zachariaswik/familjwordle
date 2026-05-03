import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
} from "@mui/material"
import { useState } from "react"
import { useNavigate, Outlet } from "react-router-dom"

import { type Guess } from "@features/game/domain/logic"
import { useStats } from "@features/stats/context/StatsContext"
import { buildShareText, copyToClipboard } from "@shared/lib/shareResult"
import { useThemeMode } from "@shared/theme/ThemeContext"

const GAME_STORAGE_KEY = "wordle-game-state"

type StoredGameState = {
  gameStatus: "playing" | "won" | "lost"
  guesses: Guess[]
  elapsedSeconds: number
  hintsUsed: number
}

function readCompletedGame(): StoredGameState | null {
  try {
    const stored = localStorage.getItem(GAME_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as StoredGameState
      if (parsed.gameStatus !== "playing") return parsed
    }
  } catch {
    // ignore
  }
  return null
}

const navItems = (hasPlayedToday: boolean) => [
  { label: "Home", path: "/", disabled: false },
  { label: "Play", path: "/play", disabled: hasPlayedToday },
  { label: "Scoreboard", path: "/scoreboard", disabled: false },
  { label: "All Time", path: "/all-time", disabled: false },
  { label: "My Stats", path: "/stats", disabled: false },
  { label: "About", path: "/about", disabled: false },
]

const HamburgerIcon = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={{ width: 22, height: 2, bgcolor: "white", borderRadius: 1 }}
      />
    ))}
  </Box>
)

const Layout: React.FC = () => {
  const navigate = useNavigate()
  const { hasPlayedToday } = useStats()
  const { mode, toggleMode } = useThemeMode()
  const theme = useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const items = navItems(hasPlayedToday)

  const handleNav = (path: string) => {
    void navigate(path)
    setDrawerOpen(false)
  }

  const canShare = hasPlayedToday || readCompletedGame() !== null

  const handleShare = async () => {
    const game = readCompletedGame()
    if (!game) return
    const text = buildShareText(
      game.guesses,
      game.elapsedSeconds,
      game.hintsUsed,
    )
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: `linear-gradient(180deg, rgba(15,118,110,0.1) 0%, ${theme.palette.background.default} 40%)`,
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

          {/* Desktop: nav buttons */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            {items.map(({ label, path, disabled }) => (
              <Button
                key={label}
                color="inherit"
                disabled={disabled}
                onClick={() => navigate(path)}
                sx={{ "&:hover": { opacity: 0.8 } }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* Share today's result */}
          {canShare && (
            <Button
              color="inherit"
              onClick={() => void handleShare()}
              sx={{ minWidth: 0, textTransform: "none", fontWeight: 600 }}
            >
              {copied ? "Copied!" : "Share"}
            </Button>
          )}

          {/* Dark mode toggle */}
          <IconButton
            color="inherit"
            onClick={toggleMode}
            aria-label="Toggle dark mode"
            sx={{ fontSize: "1.25rem" }}
          >
            {mode === "dark" ? "☀️" : "🌙"}
          </IconButton>

          {/* Mobile: hamburger button */}
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: "flex", sm: "none" } }}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 220, pt: 2 }}>
          <Divider />
          <List>
            {items.map(({ label, path, disabled }) => (
              <ListItem key={label} disablePadding>
                <ListItemButton
                  disabled={disabled}
                  onClick={() => handleNav(path)}
                >
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          color: theme.palette.text.secondary,
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
