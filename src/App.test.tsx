import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StatsProvider } from "@features/stats/context/StatsContext"

import App from "./App"

describe("App", () => {
  it("renders without crashing", () => {
    render(
      <StatsProvider>
        <App />
      </StatsProvider>,
    )
  })

  it("shows the home page by default", () => {
    render(
      <StatsProvider>
        <App />
      </StatsProvider>,
    )
    expect(screen.getByText("Welcome to Wordle")).toBeTruthy()
  })
})
