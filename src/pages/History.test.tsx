import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StatsProvider } from "../contexts/StatsContext"

import History from "./History"

describe("History", () => {
  it("renders empty state when no games played", () => {
    render(
      <StatsProvider>
        <History />
      </StatsProvider>,
    )

    expect(screen.getByText("Scores")).toBeTruthy()
    expect(
      screen.getByText(
        "No scores yet. Win a game to see your scoreboard here!",
      ),
    ).toBeTruthy()
  })
})
