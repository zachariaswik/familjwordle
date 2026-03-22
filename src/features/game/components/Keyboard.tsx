import { useTheme } from "@mui/material"

import styles from "./Keyboard.module.css"

const keyboard = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
]

// The color returned by getState() for letters with no information yet.
const UNKNOWN_BG_LIGHT = "#333333"

const Keyboard: React.FC<{
  getState: (letter: string) => string
  onChange: (guess: string) => void
  onSubmit: () => boolean
}> = ({ getState, onChange, onSubmit }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  const unknownBg = isDark ? "#818384" : UNKNOWN_BG_LIGHT
  const actionBg = isDark ? "#6b7280" : "#4b5563"
  const borderStyle = isDark ? "1px solid #565758" : "1px solid #333333"
  const keyColor = "white"

  const handleKeyClick = (letter: string) => {
    onChange(letter)
  }

  const handleEnter = () => {
    onSubmit()
  }

  const handleBackspace = () => {
    onChange("BACKSPACE")
  }

  return (
    <div className={styles.keyboard}>
      {keyboard.map((row, index) => (
        <div key={index} className={styles.row}>
          {row.map((letter) => {
            const stateBg = getState(letter)
            // Replace the hardcoded light-mode unknown color with the
            // theme-appropriate one so keys are visible in dark mode.
            const bg = stateBg === UNKNOWN_BG_LIGHT ? unknownBg : stateBg
            return (
              <span
                key={letter}
                className={styles.key}
                style={{ background: bg, border: borderStyle, color: keyColor }}
                onClick={() => handleKeyClick(letter)}
                role="button"
                tabIndex={0}
              >
                {letter}
              </span>
            )
          })}
        </div>
      ))}
      <div className={styles.row}>
        <span
          className={`${styles.key} ${styles.actionKey}`}
          style={{ background: actionBg, border: borderStyle, color: keyColor }}
          onClick={handleEnter}
          role="button"
          tabIndex={0}
          aria-label="Submit guess"
        >
          ENTER
        </span>
        <span
          className={`${styles.key} ${styles.actionKey}`}
          style={{ background: actionBg, border: borderStyle, color: keyColor }}
          onClick={handleBackspace}
          role="button"
          tabIndex={0}
          aria-label="Delete last letter"
        >
          BACKSPACE
        </span>
      </div>
    </div>
  )
}

export default Keyboard
