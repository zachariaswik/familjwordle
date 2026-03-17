import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StatsProvider } from "@features/stats/context/StatsContext"
import Scoreboard from "./Scoreboard"

describe("Scoreboard", () => {
  it("renders empty state when no games played", () => {
    render(
      <StatsProvider>
        <Scoreboard />
      </StatsProvider>,
    )

    expect(screen.getByText("Scoreboard")).toBeTruthy()
    expect(
      screen.getByText(
        "No scores yet. Win a game to see your scoreboard here!",
      ),
    ).toBeTruthy()
  })
})
