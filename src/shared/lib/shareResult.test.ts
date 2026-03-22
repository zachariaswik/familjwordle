import { describe, expect, it } from "vitest"

import { type Guess } from "@features/game/domain/logic"

import { buildShareText } from "./shareResult"

function makeGuess(text: string, states: Guess["letterStates"]): Guess {
  return { text, letterStates: states }
}

describe("buildShareText", () => {
  it("shows correct emoji for each letter state", () => {
    const guesses: Guess[] = [
      makeGuess("crane", ["correct", "present", "absent", "unknown", "absent"]),
    ]
    const result = buildShareText(guesses, 0)
    expect(result).toContain("🟩🟨⬜⬜⬜")
  })

  it("includes guess count in header without the word", () => {
    const guesses: Guess[] = [
      makeGuess("crane", [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ]),
      makeGuess("crane", [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ]),
      makeGuess("crane", [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ]),
    ]
    const result = buildShareText(guesses, 60)
    expect(result).toContain("Wordle 3/6")
    expect(result).not.toContain("CRANE")
  })

  it("formats time correctly as m:ss", () => {
    const guesses: Guess[] = [
      makeGuess("crane", [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ]),
    ]
    const result = buildShareText(guesses, 102)
    expect(result).toContain("⏱ 1:42")
  })

  it("pads seconds with leading zero", () => {
    const guesses: Guess[] = [
      makeGuess("crane", [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ]),
    ]
    const result = buildShareText(guesses, 65)
    expect(result).toContain("⏱ 1:05")
  })

  it("maps unknown state to ⬜", () => {
    const guesses: Guess[] = [
      makeGuess("crane", [
        "unknown",
        "unknown",
        "unknown",
        "unknown",
        "unknown",
      ]),
    ]
    const result = buildShareText(guesses, 0)
    expect(result).toContain("⬜⬜⬜⬜⬜")
  })

  it("produces one emoji row per guess", () => {
    const guesses: Guess[] = [
      makeGuess("crane", ["absent", "absent", "absent", "absent", "absent"]),
      makeGuess("crane", [
        "present",
        "present",
        "present",
        "present",
        "present",
      ]),
      makeGuess("crane", [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ]),
    ]
    const result = buildShareText(guesses, 0)
    const lines = result.split("\n")
    expect(lines).toContain("⬜⬜⬜⬜⬜")
    expect(lines).toContain("🟨🟨🟨🟨🟨")
    expect(lines).toContain("🟩🟩🟩🟩🟩")
  })
})
