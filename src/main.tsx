import { CssBaseline, ThemeProvider } from "@mui/material"
import { QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import ReactDOM from "react-dom/client"

import { StatsProvider } from "@features/stats/context/StatsContext"
import { queryClient } from "@shared/lib/queryClient"
import { createAppTheme } from "@shared/theme/theme"
import { ThemeModeProvider, useThemeMode } from "@shared/theme/ThemeContext"

import App from "./App"

const DynamicThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { mode } = useThemeMode()
  return (
    <ThemeProvider theme={createAppTheme(mode)}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

const root = document.getElementById("root")

if (!root) {
  throw new Error("Could not find root element")
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <DynamicThemeProvider>
          <StatsProvider>
            <App />
          </StatsProvider>
        </DynamicThemeProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
