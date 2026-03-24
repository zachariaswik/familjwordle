export type LetterState = "correct" | "present" | "absent" | "unknown"

export type Guess = {
  text: string
  letterStates: LetterState[]
}

export type State = {
  word: string
  guesses: Guess[]
  currentGuess: string
}

const stateToColor: Record<LetterState, string> = {
  correct: "#6aaa64", // Green
  present: "#e67e22", // Orange
  absent: "#787c7e", // Gray
  unknown: "#333333", // Dark
}

export function createState(word = "dizzy"): State {
  return {
    word,
    guesses: [],
    currentGuess: "",
  }
}

// Two-pass scoring for duplicate-letter correctness
function getLetterStatesForGuess(word: string, guess: string): LetterState[] {
  const result: LetterState[] = Array(guess.length).fill("absent")
  const wordLetters = word.split("")

  // Pass 1: Mark exact matches (green/correct)
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === word[i]) {
      result[i] = "correct"
      wordLetters[i] = "" // Mark as used
    }
  }

  // Pass 2: Mark present letters (yellow) from remaining unmatched letters
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "absent") {
      const index = wordLetters.indexOf(guess[i])
      if (index !== -1) {
        result[i] = "present"
        wordLetters[index] = "" // Mark as consumed
      }
    }
  }

  return result
}

export function getLetterState(
  state: State,
  letter: string,
  position?: number,
): string {
  // If position is provided, return state for that specific tile
  if (position !== undefined) {
    // Check current guess (in progress)
    if (state.currentGuess[position] === letter) {
      return stateToColor.unknown
    }

    // Check submitted guesses
    for (const guess of state.guesses) {
      if (guess.text[position] === letter) {
        return stateToColor[guess.letterStates[position]]
      }
    }

    return stateToColor.unknown
  }

  // No position: return keyboard aggregated state for this letter across all guesses
  // Precedence: correct > present > absent > unknown
  let bestState: LetterState = "unknown"

  for (const guess of state.guesses) {
    for (let i = 0; i < guess.text.length; i++) {
      if (guess.text[i] === letter) {
        const letterState = guess.letterStates[i]

        if (letterState === "correct") {
          bestState = "correct"
        } else if (letterState === "present" && bestState !== "correct") {
          bestState = "present"
        } else if (letterState === "absent" && bestState === "unknown") {
          bestState = "absent"
        }
      }
    }
  }

  return stateToColor[bestState]
}

export function checkGuess(state: State, guess: string): boolean {
  // Validate: must be exactly 5 letters
  if (guess.length !== 5) {
    return false
  }

  // Validate: must be all alphabetic
  if (!/^[a-z]+$/i.test(guess)) {
    return false
  }

  return true
}

export function computeLetterStates(
  word: string,
  guess: string,
): LetterState[] {
  return getLetterStatesForGuess(word, guess)
}
