import { describe, expect, it } from "vitest"

import {
  checkGuess,
  computeLetterStates,
  createState,
  getLetterState,
} from "./logic"

describe("createState", () => {
  it("returns default word", () => {
    expect(createState().word).toBe("dizzy")
  })

  it("returns empty guesses", () => {
    expect(createState().guesses).toEqual([])
  })

  it("returns empty currentGuess", () => {
    expect(createState().currentGuess).toBe("")
  })
})

describe("checkGuess", () => {
  const state = createState()

  it("accepts valid five-letter words", () => {
    expect(checkGuess(state, "crane")).toBe(true)
  })

  it("rejects short guesses", () => {
    expect(checkGuess(state, "cat")).toBe(false)
  })

  it("rejects long guesses", () => {
    expect(checkGuess(state, "planet")).toBe(false)
  })

  it("rejects non-alpha guesses", () => {
    expect(checkGuess(state, "ab1de")).toBe(false)
    expect(checkGuess(state, "ab-de")).toBe(false)
  })
})

describe("computeLetterStates", () => {
  it("marks exact matches as correct", () => {
    expect(computeLetterStates("crane", "crane")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ])
  })

  it("marks non-existing letters as absent", () => {
    expect(computeLetterStates("crane", "flops")).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ])
  })

  it("handles duplicate letters with two-pass scoring", () => {
    expect(computeLetterStates("dizzy", "zizzy")).toEqual([
      "absent",
      "correct",
      "correct",
      "correct",
      "correct",
    ])
  })

  it("does not over-credit duplicates", () => {
    expect(computeLetterStates("hello", "llool")).toEqual([
      "present",
      "present",
      "present",
      "absent",
      "absent",
    ])
  })
})

describe("getLetterState", () => {
  it("returns unknown for letters with no history", () => {
    expect(getLetterState(createState(), "q")).toBe("#333333")
  })

  it("returns per-tile color for submitted guesses", () => {
    const guessStates = computeLetterStates("crane", "nacre")
    const state = {
      word: "crane",
      guesses: [{ text: "nacre", letterStates: guessStates }],
      currentGuess: "",
    }

    expect(getLetterState(state, "n", 0)).toBe("#c9b458")
    expect(getLetterState(state, "a", 1)).toBe("#c9b458")
  })

  it("aggregates keyboard state with precedence correct > present > absent", () => {
    const state = {
      word: "crane",
      guesses: [
        {
          text: "flops",
          letterStates: computeLetterStates("crane", "flops"),
        },
        {
          text: "nacre",
          letterStates: computeLetterStates("crane", "nacre"),
        },
        {
          text: "crane",
          letterStates: computeLetterStates("crane", "crane"),
        },
      ],
      currentGuess: "",
    }

    expect(getLetterState(state, "f")).toBe("#787c7e")
    expect(getLetterState(state, "n")).toBe("#6aaa64")
    expect(getLetterState(state, "c")).toBe("#6aaa64")
  })
})
