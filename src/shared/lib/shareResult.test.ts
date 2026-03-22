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
    const result = buildShareText(guesses, 0, 0)
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
    const result = buildShareText(guesses, 60, 0)
    expect(result).toContain("Wordle 3/6")
    expect(result).not.toContain("CRANE")
  })

  it("includes the app URL", () => {
    const guesses: Guess[] = [
      makeGuess("crane", [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ]),
    ]
    const result = buildShareText(guesses, 0, 0)
    expect(result).toContain(window.location.origin)
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
    const result = buildShareText(guesses, 102, 0)
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
    const result = buildShareText(guesses, 65, 0)
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
    const result = buildShareText(guesses, 0, 0)
    expect(result).toContain("⬜⬜⬜⬜⬜")
  })

  it("includes hints line when hints were used", () => {
    const guesses: Guess[] = [
      makeGuess("crane", [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ]),
    ]
    expect(buildShareText(guesses, 0, 1)).toContain("💡 1 hint used")
    expect(buildShareText(guesses, 0, 3)).toContain("💡 3 hints used")
  })

  it("omits hints line when no hints were used", () => {
    const guesses: Guess[] = [
      makeGuess("crane", [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ]),
    ]
    const result = buildShareText(guesses, 0, 0)
    expect(result).not.toContain("hint")
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
    const result = buildShareText(guesses, 0, 0)
    const lines = result.split("\n")
    expect(lines).toContain("⬜⬜⬜⬜⬜")
    expect(lines).toContain("🟨🟨🟨🟨🟨")
    expect(lines).toContain("🟩🟩🟩🟩🟩")
  })
})
