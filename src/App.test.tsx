import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StatsProvider } from "@features/stats/context/StatsContext"
import { ThemeModeProvider } from "@shared/theme/ThemeContext"

import App from "./App"

function renderApp() {
  return render(
    <ThemeModeProvider>
      <StatsProvider>
        <App />
      </StatsProvider>
    </ThemeModeProvider>,
  )
}

describe("App", () => {
  it("renders without crashing", () => {
    renderApp()
  })

  it("shows the home page by default", () => {
    renderApp()
    expect(screen.getByText("Welcome! What's your name?")).toBeTruthy()
  })
})
