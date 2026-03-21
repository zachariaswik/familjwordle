import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  type PaginatedScores,
  type ScoreRecord,
} from "@features/stats/api/scoreApi"

import AllTimeScores from "./AllTimeScores"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeScore(
  overrides: Partial<ScoreRecord> & Pick<ScoreRecord, "playerName" | "guesses">,
): ScoreRecord {
  return {
    word: "crane",
    date: "2026-01-15T10:00:00.000Z",
    timeTakenSeconds: null,
    ...overrides,
  }
}

function makePaginatedResponse(
  scores: ScoreRecord[],
  overrides: Partial<Omit<PaginatedScores, "scores">> = {},
): PaginatedScores {
  return {
    scores,
    total: scores.length,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    ...overrides,
  }
}

function mockFetch(payload: PaginatedScores) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => payload,
  }) as typeof fetch
}

function renderAllTime() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <AllTimeScores />
    </QueryClientProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AllTimeScores", () => {
  it("shows a loading spinner initially", () => {
    global.fetch = vi.fn().mockReturnValue(
      new Promise(() => {
        // never resolves
      }),
    ) as typeof fetch

    renderAllTime()
    expect(screen.getByRole("progressbar")).toBeTruthy()
  })

  it("shows empty state when no scores exist", async () => {
    mockFetch(makePaginatedResponse([]))
    renderAllTime()
    expect(
      await screen.findByText("No scores yet. Win a game to appear here!"),
    ).toBeTruthy()
  })

  it("shows an error message when the fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as typeof fetch

    renderAllTime()
    expect(await screen.findByText(/Could not load scores/i)).toBeTruthy()
  })

  it("renders score rows with rank, name, guesses, time and date columns", async () => {
    mockFetch(
      makePaginatedResponse([
        makeScore({ playerName: "Alice", guesses: 2, timeTakenSeconds: 42 }),
        makeScore({ playerName: "Bob", guesses: 3, timeTakenSeconds: null }),
      ]),
    )

    renderAllTime()

    // Both card and table are in the DOM (CSS-hidden on desktop/mobile respectively)
    expect((await screen.findAllByText("Alice")).length).toBeGreaterThan(0)
    expect(screen.getAllByText("Bob").length).toBeGreaterThan(0)

    // Rank numbers appear in both views (top-2 get medal emojis)
    expect(screen.getAllByText("🥇 1").length).toBeGreaterThan(0)
    expect(screen.getAllByText("🥈 2").length).toBeGreaterThan(0)

    // Formatted time for Alice; em-dash for Bob (each appears in card + table)
    expect(screen.getAllByText("0:42").length).toBeGreaterThan(0)
    expect(screen.getAllByText("—").length).toBeGreaterThan(0)

    // /6 appears once per player per view (2 players × 2 views = 4)
    expect(screen.getAllByText(/\/6/).length).toBeGreaterThanOrEqual(2)
  })

  it("does not show a pagination control when there is only one page", async () => {
    mockFetch(
      makePaginatedResponse([makeScore({ playerName: "Alice", guesses: 2 })]),
    )
    renderAllTime()
    expect((await screen.findAllByText("Alice")).length).toBeGreaterThan(0)
    expect(screen.queryByRole("navigation")).toBeNull()
  })

  it("shows pagination and allows navigating to the next page", async () => {
    const user = userEvent.setup()

    // First page
    mockFetch(
      makePaginatedResponse([makeScore({ playerName: "Alice", guesses: 2 })], {
        total: 21,
        totalPages: 2,
        page: 1,
      }),
    )

    renderAllTime()
    expect((await screen.findAllByText("Alice")).length).toBeGreaterThan(0)

    expect(screen.getByRole("navigation")).toBeTruthy()

    // Second page response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        makePaginatedResponse([makeScore({ playerName: "Bob", guesses: 3 })], {
          total: 21,
          totalPages: 2,
          page: 2,
        }),
    }) as typeof fetch

    const nav = screen.getByRole("navigation")
    await user.click(within(nav).getByText("2"))

    // Global rank on page 2 should start at 21
    expect((await screen.findAllByText("Bob")).length).toBeGreaterThan(0)
    expect(screen.getAllByText("21").length).toBeGreaterThan(0)
  })

  it("shows the date column formatted as readable string", async () => {
    mockFetch(
      makePaginatedResponse([
        makeScore({
          playerName: "Alice",
          guesses: 2,
          date: "2026-01-15T10:00:00.000Z",
        }),
      ]),
    )

    renderAllTime()
    expect((await screen.findAllByText("Alice")).length).toBeGreaterThan(0)
    // The date should appear in some readable format (not raw ISO)
    expect(screen.queryByText("2026-01-15T10:00:00.000Z")).toBeNull()
  })
})
