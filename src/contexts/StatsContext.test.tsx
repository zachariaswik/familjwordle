import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { StatsProvider, useStats, type GameRecord } from "./StatsContext"

const StatsProbe: React.FC = () => {
  const { history, recordWin } = useStats()

  return (
    <>
      <p data-testid="history-count">{history.length}</p>
      {history.map((record, index) => (
        <p key={`${record.playerName}-${index}`}>{record.playerName}</p>
      ))}
      <button
        type="button"
        onClick={() => {
          recordWin("Person C", "dizzy", 2)
        }}
      >
        Save win
      </button>
    </>
  )
}

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe("StatsContext shared leaderboard", () => {
  it("loads history from backend scores API", async () => {
    const sharedHistory: GameRecord[] = [
      {
        playerName: "Person A",
        word: "dizzy",
        guesses: 3,
        date: "2026-03-12T10:00:00.000Z",
      },
    ]

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => sharedHistory,
    } as Response)

    render(
      <StatsProvider>
        <StatsProbe />
      </StatsProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("history-count")).toHaveTextContent("1")
    })
    expect(screen.getByText("Person A")).toBeTruthy()
  })

  it("saves wins to backend and refreshes history", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.spyOn(global, "fetch")

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response)

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        playerName: "Person C",
        word: "dizzy",
        guesses: 2,
        date: "2026-03-12T12:00:00.000Z",
      }),
    } as Response)

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          playerName: "Person C",
          word: "dizzy",
          guesses: 2,
          date: "2026-03-12T12:00:00.000Z",
        },
      ],
    } as Response)

    render(
      <StatsProvider>
        <StatsProbe />
      </StatsProvider>,
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/scores")
    })

    await user.click(screen.getByRole("button", { name: "Save win" }))

    await waitFor(() => {
      expect(screen.getByTestId("history-count")).toHaveTextContent("1")
    })
    expect(screen.getByText("Person C")).toBeTruthy()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/scores",
      expect.objectContaining({ method: "POST" }),
    )
  })
})
