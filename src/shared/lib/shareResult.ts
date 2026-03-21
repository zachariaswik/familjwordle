import { type Guess } from "@features/game/domain/logic"

const EMOJI: Record<string, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬜",
  unknown: "⬜",
}

export function buildShareText(
  guesses: Guess[],
  word: string,
  timeTakenSeconds: number,
): string {
  const guessCount = guesses.length
  const wordDisplay = word.toUpperCase()

  const minutes = Math.floor(timeTakenSeconds / 60)
  const seconds = timeTakenSeconds % 60
  const timeStr = `⏱ ${minutes}:${String(seconds).padStart(2, "0")}`

  const grid = guesses
    .map((g) => g.letterStates.map((s) => EMOJI[s] ?? "⬜").join(""))
    .join("\n")

  return `Wordle ${wordDisplay} ${guessCount}/6\n\n${grid}\n\n${timeStr}`
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}
