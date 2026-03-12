import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e",
      light: "#2dd4bf",
      dark: "#115e59",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f97316",
      light: "#fb923c",
      dark: "#c2410c",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: "0.04em",
    },
    button: {
      fontWeight: 700,
      letterSpacing: "0.03em",
    },
  },
  shape: {
    borderRadius: 12,
  },
})

export default theme
