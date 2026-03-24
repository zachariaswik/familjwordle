import { useTheme } from "@mui/material"
import cx from "classnames"

import { type Guess, type LetterState } from "../domain/logic"

import styles from "./Guesses.module.css"

const NUM_GUESSES = 6
const LETTERS_PER_GUESS = 5

const stateToColor: Record<LetterState, string> = {
  correct: "#6aaa64",
  present: "#e67e22",
  absent: "#787c7e",
  unknown: "#333333",
}

const Guesses: React.FC<{
  guesses: Guess[]
  currentGuess: string
}> = ({ guesses, currentGuess }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  const unknownBg = isDark ? "#818384" : "#333333"
  const borderStyle = isDark ? "1px solid #565758" : "1px solid #333333"
  const tileColor = "white"

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
                    border: borderStyle,
                    color: tileColor,
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
                style={{
                  background: unknownBg,
                  border: borderStyle,
                  color: tileColor,
                }}
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
