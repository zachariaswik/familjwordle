import { describe, expect, it, vi } from "vitest"

import {
  fetchDailyWord,
  fetchWordDefinition,
  fetchWordList,
  isValidWord,
} from "./wordApi"

describe("isValidWord", () => {
  it("validates five-letter lowercase alphabetic words", () => {
    expect(isValidWord("dizzy")).toBe(true)
    expect(isValidWord("crane")).toBe(true)
    expect(isValidWord("toolong")).toBe(false)
    expect(isValidWord("no1pe")).toBe(false)
    expect(isValidWord("DiZzY")).toBe(false)
    expect(isValidWord("four")).toBe(false)
  })
})

const mockFetchText = (text: string) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      text: async () => text,
    }),
  )
}

describe("fetchWordList", () => {
  it("parses newline-separated word list and filters to 5-letter words", async () => {
    mockFetchText("apple\nhi\ngrape\ncrane\ntoolong\n")

    const words = await fetchWordList()
    expect(words).toEqual(["apple", "grape", "crane"])
  })

  it("throws for non-ok responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )

    await expect(fetchWordList()).rejects.toThrow("status 500")
  })

  it("throws when no valid five-letter words found", async () => {
    mockFetchText("hi\nbye\n")

    await expect(fetchWordList()).rejects.toThrow("no valid five-letter words")
  })
})

describe("fetchDailyWord", () => {
  it("returns a valid 5-letter word", async () => {
    mockFetchText("dizzy\ncrate\nhello\n")

    await expect(fetchDailyWord()).resolves.toMatch(/^[a-z]{5}$/)
  })

  it("propagates fetch/network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    await expect(fetchDailyWord()).rejects.toThrow("network down")
  })
})

describe("fetchWordDefinition", () => {
  it("returns the first available definition", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            meanings: [
              {
                definitions: [
                  {
                    definition: "A lifting machine for raising heavy objects.",
                  },
                ],
              },
            ],
          },
        ],
      }),
    )

    await expect(fetchWordDefinition("crane")).resolves.toBe(
      "A lifting machine for raising heavy objects.",
    )
  })

  it("throws for non-ok responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    )

    await expect(fetchWordDefinition("zzzzz")).rejects.toThrow("status 404")
  })

  it("throws when no definition is found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ meanings: [] }],
      }),
    )

    await expect(fetchWordDefinition("crane")).rejects.toThrow(
      "No definition found",
    )
  })
})
