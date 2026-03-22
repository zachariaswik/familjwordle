import { useTheme } from "@mui/material"
import cx from "classnames"

import { type HintState } from "../context/GameContext"
import { type Guess, type LetterState } from "../domain/logic"

import styles from "./Guesses.module.css"

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
  hintSlot?: HintState | null
}> = ({ guesses, currentGuess, hintSlot }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  // In dark mode the page background is #121212 — dark tiles (#333333) are
  // nearly invisible. Switch to a medium gray that stands out clearly.
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

        if (rowIndex === guesses.length) {
          // Current row — compose display from user input + optional hint slot
          type Cell = { letter: string; isHint: boolean }
          const cells: Cell[] = []
          let gIdx = 0
          for (let i = 0; i < LETTERS_PER_GUESS; i++) {
            if (hintSlot?.position === i) {
              cells.push({ letter: hintSlot?.letter ?? "", isHint: true })
            } else {
              cells.push({
                letter: gIdx < currentGuess.length ? currentGuess[gIdx] : " ",
                isHint: false,
              })
              gIdx++
            }
          }

          return (
            <div key={rowIndex} className={styles.row}>
              {cells.map(({ letter, isHint }, colIndex) => (
                <span
                  key={colIndex}
                  className={styles.letter}
                  style={{
                    background: isHint ? stateToColor.correct : unknownBg,
                    border: borderStyle,
                    color: tileColor,
                  }}
                >
                  {letter === " " ? "_" : letter}
                </span>
              ))}
            </div>
          )
        }

        // Empty row
        return (
          <div key={rowIndex} className={styles.row}>
            {"     ".split("").map((_, colIndex) => (
              <span
                key={colIndex}
                className={styles.letter}
                style={{
                  background: unknownBg,
                  border: borderStyle,
                  color: tileColor,
                }}
              >
                _
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default Guesses
