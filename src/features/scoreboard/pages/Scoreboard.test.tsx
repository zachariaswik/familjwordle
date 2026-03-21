import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { StatsProvider } from "@features/stats/context/StatsContext"
import { type GameRecord } from "@features/stats/context/StatsContext"

import Scoreboard, { rankScore } from "./Scoreboard"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TODAY = new Date().toISOString()

function makeRecord(
  overrides: Partial<GameRecord> & Pick<GameRecord, "playerName" | "guesses">,
): GameRecord {
  return {
    word: "crane",
    date: TODAY,
    timeTakenSeconds: null,
    ...overrides,
  }
}

function mockFetch(records: GameRecord[]) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => records,
  }) as typeof fetch
}

function renderScoreboard(records: GameRecord[]) {
  mockFetch(records)
  return render(
    <StatsProvider>
      <Scoreboard />
    </StatsProvider>,
  )
}

// ---------------------------------------------------------------------------
// rankScore unit tests
// ---------------------------------------------------------------------------

describe("rankScore", () => {
  it("gives a lower rank to fewer guesses regardless of time", () => {
    const fast = makeRecord({
      playerName: "A",
      guesses: 3,
      timeTakenSeconds: 0,
    })
    const slow = makeRecord({
      playerName: "B",
      guesses: 2,
      timeTakenSeconds: 999,
    })
    expect(rankScore(slow)).toBeLessThan(rankScore(fast))
  })

  it("breaks ties within the same guess count by time", () => {
    const fast = makeRecord({
      playerName: "A",
      guesses: 3,
      timeTakenSeconds: 30,
    })
    const slow = makeRecord({
      playerName: "B",
      guesses: 3,
      timeTakenSeconds: 90,
    })
    expect(rankScore(fast)).toBeLessThan(rankScore(slow))
  })

  it("ranks null-time entries below timed entries of the same guess count", () => {
    const timed = makeRecord({
      playerName: "A",
      guesses: 3,
      timeTakenSeconds: 500,
    })
    const noTime = makeRecord({
      playerName: "B",
      guesses: 3,
      timeTakenSeconds: null,
    })
    expect(rankScore(timed)).toBeLessThan(rankScore(noTime))
  })

  it("keeps null-time entries above the next guess bucket", () => {
    const noTime = makeRecord({
      playerName: "A",
      guesses: 2,
      timeTakenSeconds: null,
    })
    const nextBucket = makeRecord({
      playerName: "B",
      guesses: 3,
      timeTakenSeconds: 0,
    })
    expect(rankScore(noTime)).toBeLessThan(rankScore(nextBucket))
  })
})

// ---------------------------------------------------------------------------
// Scoreboard rendering tests
// ---------------------------------------------------------------------------

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

  it("hides 1-guess entries (considered lucky, not skill)", async () => {
    renderScoreboard([
      makeRecord({ playerName: "Lucky", guesses: 1 }),
      makeRecord({ playerName: "Alice", guesses: 3, timeTakenSeconds: 60 }),
    ])

    // Both card and table are in the DOM (CSS-hidden on desktop/mobile respectively)
    expect((await screen.findAllByText("Alice")).length).toBeGreaterThan(0)
    expect(screen.queryByText("Lucky")).toBeNull()
  })

  it("shows empty state when only 1-guess entries exist", async () => {
    renderScoreboard([makeRecord({ playerName: "Lucky", guesses: 1 })])

    await screen.findByText(
      "No scores yet. Win a game to see your scoreboard here!",
    )
  })

  it("sorts by guesses ascending, then by time ascending", async () => {
    renderScoreboard([
      makeRecord({ playerName: "Charlie", guesses: 4, timeTakenSeconds: 10 }),
      makeRecord({ playerName: "Alice", guesses: 2, timeTakenSeconds: 200 }),
      makeRecord({ playerName: "Bob", guesses: 3, timeTakenSeconds: 45 }),
    ])

    const rows = await screen.findAllByRole("row")
    // rows[0] is the header; rows[1..] are data rows
    const names = rows
      .slice(1)
      .map((r) => within(r).getByRole("cell", { name: /^[A-Z]/ }).textContent)
    expect(names).toEqual(["Alice", "Bob", "Charlie"])
  })

  it("within the same guess count, sorts faster times first", async () => {
    renderScoreboard([
      makeRecord({ playerName: "Slow", guesses: 3, timeTakenSeconds: 300 }),
      makeRecord({ playerName: "Fast", guesses: 3, timeTakenSeconds: 30 }),
    ])

    const rows = await screen.findAllByRole("row")
    const names = rows
      .slice(1)
      .map((r) => within(r).getByRole("cell", { name: /^[A-Z]/ }).textContent)
    expect(names).toEqual(["Fast", "Slow"])
  })

  it("ranks null-time entries below timed entries of the same guess count", async () => {
    renderScoreboard([
      makeRecord({ playerName: "NoTime", guesses: 3, timeTakenSeconds: null }),
      makeRecord({ playerName: "Timed", guesses: 3, timeTakenSeconds: 500 }),
    ])

    const rows = await screen.findAllByRole("row")
    const names = rows
      .slice(1)
      .map((r) => within(r).getByRole("cell", { name: /^[A-Z]/ }).textContent)
    expect(names).toEqual(["Timed", "NoTime"])
  })

  it("displays rank numbers starting at 1", async () => {
    renderScoreboard([
      makeRecord({ playerName: "Alice", guesses: 2, timeTakenSeconds: 60 }),
      makeRecord({ playerName: "Bob", guesses: 3, timeTakenSeconds: 30 }),
    ])

    // Both card and table are in the DOM so rank numbers appear twice each
    expect((await screen.findAllByText("Alice")).length).toBeGreaterThan(0)
    expect(screen.getAllByText("1").length).toBeGreaterThan(0)
    expect(screen.getAllByText("2").length).toBeGreaterThan(0)
  })
})
