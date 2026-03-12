import cx from "classnames"

import styles from "./Guesses.module.css"
import { type Guess, type LetterState } from "./logic"

const NUM_GUESSES = 6
const LETTERS_PER_GUESS = 5

const stateToColor: Record<LetterState, string> = {
  correct: "#6aaa64",
  present: "#c9b458",
  absent: "#787c7e",
  unknown: "#333333",
}

const Guesses: React.FC<{
  guesses: Guess[]
  currentGuess: string
}> = ({ guesses, currentGuess }) => {
  return (
    <div className={cx("guesses", styles.guesses)}>
      {Array.from({ length: NUM_GUESSES }).map((_, rowIndex) => {
        if (rowIndex < guesses.length) {
          // Submitted row — use pre-computed letter states
          const guess = guesses[rowIndex]
          return (
            <div key={rowIndex} className={styles.row}>
              {guess.text.split("").map((letter, colIndex) => (
                <span
                  key={colIndex}
                  className={styles.letter}
                  style={{
                    background: stateToColor[guess.letterStates[colIndex]],
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          )
        }

        // Current or empty row
        const displayWord =
          rowIndex === guesses.length
            ? currentGuess.padEnd(LETTERS_PER_GUESS, " ")
            : "     "

        return (
          <div key={rowIndex} className={styles.row}>
            {displayWord.split("").map((letter, colIndex) => (
              <span
                key={colIndex}
                className={styles.letter}
                style={{ background: stateToColor.unknown }}
              >
                {letter === " " ? "_" : letter}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default Guesses
