import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import { Suspense, type FC } from "react"
import { describe, expect, it, vi } from "vitest"

import ErrorBoundary from "../components/ErrorBoundary"
import PlayLoadError from "../components/PlayLoadError"

import { useDailyWordSuspense } from "./useWordService"

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const HookConsumer: FC = () => {
  const word = useDailyWordSuspense()
  return <div>{word}</div>
}

describe("useDailyWordSuspense", () => {
  it("resolves and renders fetched word", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "dizzy\n",
      }),
    )

    const queryClient = createTestClient()

    render(
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>Loading...</div>}>
          <HookConsumer />
        </Suspense>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("dizzy")).toBeTruthy()
    })
  })

  it("surfaces errors to an error boundary", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )

    const queryClient = createTestClient()

    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary
          fallbackRender={() => <PlayLoadError onRetry={() => undefined} />}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <HookConsumer />
          </Suspense>
        </ErrorBoundary>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Could not load a new word.")).toBeTruthy()
    })
  })
})
