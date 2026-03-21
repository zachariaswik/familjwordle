import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { StatsProvider } from "@features/stats/context/StatsContext"
import { ThemeModeProvider } from "@shared/theme/ThemeContext"

import Layout from "./Layout"

describe("Layout", () => {
  it("renders top navigation and footer", () => {
    render(
      <ThemeModeProvider>
        <StatsProvider>
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<div>Home Content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </StatsProvider>
      </ThemeModeProvider>,
    )

    expect(screen.getByText("Wordle")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Home" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Scoreboard" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "About" })).toBeTruthy()
    expect(screen.getByText("Home Content")).toBeTruthy()
    expect(screen.getByText(/2026 Wordle Class Project/)).toBeTruthy()
  })
})
