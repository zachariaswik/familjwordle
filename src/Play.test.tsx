import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { GameProvider } from "./contexts/GameContext"
import { StatsProvider } from "./contexts/StatsContext"
import Play from "./Play"

const defaultValidWords = new Set(["dizzy", "crane", "hello", "world", "abcde"])

const renderPlay = (word = "dizzy", validWords = defaultValidWords) =>
  renderPlayWithClient(word, validWords)

const renderPlayWithClient = (word = "dizzy", validWords = defaultValidWords) =>
  render(
    <StatsProvider>
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: {
              queries: {
                retry: false,
              },
            },
          })
        }
      >
        <GameProvider initialWord={word} validWords={validWords}>
          <Play />
        </GameProvider>
      </QueryClientProvider>
    </StatsProvider>,
  )

describe("Play", () => {
  const word = "dizzy"

  describe("comprehensive render", () => {
    it("renders board and keyboard", () => {
      renderPlay(word)

      expect(screen.getAllByText("_")).toHaveLength(30)
      expect(screen.getByLabelText("Submit guess")).toBeTruthy()
      expect(screen.getByLabelText("Delete last letter")).toBeTruthy()
      expect(screen.getByRole("button", { name: "q" })).toBeTruthy()
      expect(screen.getByRole("button", { name: "m" })).toBeTruthy()
    })
  })

  describe("user interactions", () => {
    it("adds and removes letters via keyboard", async () => {
      const user = userEvent.setup()
      renderPlay(word)

      await user.click(screen.getByRole("button", { name: "h" }))
      expect(screen.getAllByText("_")).toHaveLength(29)

      await user.click(screen.getByLabelText("Delete last letter"))
      expect(screen.getAllByText("_")).toHaveLength(30)
    })

    it("submits a valid guess on ENTER", async () => {
      const user = userEvent.setup()
      renderPlay(word)

      for (const letter of ["c", "r", "a", "n", "e"]) {
        await user.click(screen.getByRole("button", { name: letter }))
      }

      expect(screen.getAllByText("_")).toHaveLength(25)

      await user.click(screen.getByLabelText("Submit guess"))

      // Current row clears after submission while one submitted row remains filled.
      expect(screen.getAllByText("_")).toHaveLength(25)
    })

    it("does not allow more than five letters before submit", async () => {
      const user = userEvent.setup()
      renderPlay(word)

      for (const letter of ["c", "r", "a", "n", "e", "s"]) {
        await user.click(screen.getByRole("button", { name: letter }))
      }

      expect(screen.getAllByText("_")).toHaveLength(25)
    })

    it("shows the success message and definition after a correct guess", async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            meanings: [
              {
                definitions: [{ definition: "A noisy spinning motion." }],
              },
            ],
          },
        ],
      }) as typeof fetch

      renderPlay(word)

      for (const letter of ["d", "i", "z", "z", "y"]) {
        await user.click(screen.getByRole("button", { name: letter }))
      }

      await user.click(screen.getByLabelText("Submit guess"))

      expect(screen.getByText("You solved it!")).toBeTruthy()
      expect(
        screen.getByText("Correct guess! Well done, the word is dizzy"),
      ).toBeTruthy()
      expect(await screen.findByText("A noisy spinning motion.")).toBeTruthy()

      await user.type(screen.getByLabelText("Your name"), "Erik")
      await user.click(screen.getByRole("button", { name: "Save score" }))

      await waitFor(() => {
        expect(screen.queryByText("You solved it!")).toBeNull()
      })
    })

    it("shows the revealed word and definition after a loss", async () => {
      const user = userEvent.setup()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            meanings: [
              {
                definitions: [
                  { definition: "A wading bird with long legs and neck." },
                ],
              },
            ],
          },
        ],
      }) as typeof fetch

      renderPlay(word)

      for (let attempt = 0; attempt < 6; attempt += 1) {
        for (const letter of ["c", "r", "a", "n", "e"]) {
          await user.click(screen.getByRole("button", { name: letter }))
        }
        await user.click(screen.getByLabelText("Submit guess"))
      }

      expect(
        screen.getByText("Good effort! The right guess is DIZZY."),
      ).toBeTruthy()
      expect(
        await screen.findByText("A wading bird with long legs and neck."),
      ).toBeTruthy()
    })
  })
})
