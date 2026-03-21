import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { StatsProvider } from "@features/stats/context/StatsContext"

import PlayPage from "./PlayPage"

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithQuery = () => {
  const queryClient = createTestClient()

  return render(
    <StatsProvider>
      <QueryClientProvider client={queryClient}>
        <PlayPage />
      </QueryClientProvider>
    </StatsProvider>,
  )
}

describe("Play page", () => {
  it("shows suspense fallback while loading", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise<never>(() => {
            // Intentionally unresolved to keep Suspense fallback visible.
          }),
      ),
    )

    renderWithQuery()

    expect(screen.getByText("Loading game...")).toBeTruthy()
  })

  it("renders heading and game board after successful fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "dizzy\ncrane\nhello\n",
      }),
    )

    renderWithQuery()

    expect(screen.getByText("Wordle")).toBeTruthy()

    await waitFor(() => {
      expect(screen.getAllByText("_")).toHaveLength(30)
    })
  })

  it("shows dev mode banner and allows unlimited plays", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise<never>(() => {
            // Intentionally unresolved — we only need the banner to render.
          }),
      ),
    )

    renderWithQuery()

    expect(screen.getByText("Dev mode — unlimited plays enabled")).toBeTruthy()
  })

  it("renders load error fallback when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )

    renderWithQuery()

    await waitFor(() => {
      expect(screen.getByText("Could not load a new word.")).toBeTruthy()
    })
  })
})
