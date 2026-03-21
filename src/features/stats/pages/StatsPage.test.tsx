import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"

import { StatsProvider } from "@features/stats/context/StatsContext"

import StatsPage from "./StatsPage"

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@features/player/hooks/usePlayerName", () => ({
  usePlayerName: () => ({ name: "TestPlayer" }),
}))

const mockPaginatedResponse = (scores: unknown[]) => ({
  scores,
  total: scores.length,
  page: 1,
  pageSize: 100,
  totalPages: 1,
})

function mockFetch(scores: unknown[]) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes("all=true")) {
      return Promise.resolve({
        ok: true,
        json: async () => mockPaginatedResponse(scores),
      })
    }
    return Promise.resolve({ ok: true, json: async () => [] })
  }) as typeof fetch
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <StatsProvider>
        <StatsPage />
      </StatsProvider>
    </QueryClientProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

describe("StatsPage", () => {
  it("renders summary stats", () => {
    mockFetch([])
    renderPage()
    expect(screen.getByText("My Stats")).toBeTruthy()
    expect(screen.getByText("Win Rate")).toBeTruthy()
    expect(screen.getByText("Games Played")).toBeTruthy()
    expect(screen.getByText("Current Streak")).toBeTruthy()
    expect(screen.getByText("Best Streak")).toBeTruthy()
  })

  it("shows 'No personal records found' when API returns empty", async () => {
    mockFetch([])
    renderPage()
    expect(await screen.findByText("No personal records found.")).toBeTruthy()
  })

  it("shows recent game rows when API returns data", async () => {
    const scores = [
      {
        playerName: "TestPlayer",
        word: "crane",
        guesses: 3,
        date: new Date().toISOString(),
        timeTakenSeconds: 60,
      },
    ]
    mockFetch(scores)
    renderPage()
    expect(await screen.findByText("CRANE")).toBeTruthy()
    expect(screen.getByText("3/6")).toBeTruthy()
  })
})
