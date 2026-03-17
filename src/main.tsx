import { CssBaseline, ThemeProvider } from "@mui/material"
import { QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import ReactDOM from "react-dom/client"

import { StatsProvider } from "@features/stats/context/StatsContext"
import { queryClient } from "@shared/lib/queryClient"
import theme from "@shared/theme/theme"

import App from "./App"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Could not find root element")
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StatsProvider>
          <App />
        </StatsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
