import { useState } from "react"
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material"
import { useNavigate, Outlet } from "react-router-dom"

import { useStats } from "@features/stats/context/StatsContext"

const navItems = (hasPlayedToday: boolean) => [
  { label: "Home", path: "/", disabled: false },
  { label: "Play", path: "/play", disabled: hasPlayedToday },
  { label: "Scoreboard", path: "/scoreboard", disabled: false },
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
  const { gamesPlayed, gamesWon, currentStreak, hasPlayedToday } = useStats()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const items = navItems(hasPlayedToday)

  const handleNav = (path: string) => {
    navigate(path)
    setDrawerOpen(false)
  }

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

          {/* Desktop: stats chips */}
          {gamesPlayed > 0 && (
            <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1, mr: 2 }}>
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
          {gamesPlayed > 0 && (
            <Box sx={{ display: "flex", gap: 1, px: 2, pb: 2 }}>
              <Chip
                label={`${gamesWon}W`}
                size="small"
                sx={{ bgcolor: "#0f766e", color: "white" }}
              />
              <Chip
                label={`${currentStreak} streak`}
                size="small"
                sx={{ bgcolor: "#0f766e", color: "white" }}
              />
            </Box>
          )}
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
