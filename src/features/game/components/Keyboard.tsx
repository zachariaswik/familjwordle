import { useTheme } from "@mui/material"

import styles from "./Keyboard.module.css"

const keyboard = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
]

// Colors returned by getState() from the game logic.
const UNKNOWN_COLOR = "#333333"
const ABSENT_COLOR = "#787c7e"

function getKeyStyle(
  stateBg: string,
  isDark: boolean,
): { background: string; color: string } {
  if (stateBg === UNKNOWN_COLOR) {
    // Untried letter: light neutral background so tried letters stand out.
    return isDark
      ? { background: "#818384", color: "white" }
      : { background: "#d3d6da", color: "#333333" }
  }
  if (stateBg === ABSENT_COLOR) {
    // Tried but not in word: clearly dimmed.
    return isDark
      ? { background: "#3a3a3c", color: "#808080" }
      : { background: "#787c7e", color: "#cccccc" }
  }
  // Correct (green) or present (orange): keep as-is with white text.
  return { background: stateBg, color: "white" }
}

const Keyboard: React.FC<{
  getState: (letter: string) => string
  onChange: (guess: string) => void
  onSubmit: () => boolean
}> = ({ getState, onChange, onSubmit }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  const actionBg = isDark ? "#6b7280" : "#4b5563"
  const borderStyle = isDark ? "1px solid #565758" : "1px solid #333333"

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
            const { background, color } = getKeyStyle(stateBg, isDark)
            return (
              <span
                key={letter}
                className={styles.key}
                style={{ background, border: borderStyle, color }}
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
          style={{ background: actionBg, border: borderStyle, color: "white" }}
          onClick={handleEnter}
          role="button"
          tabIndex={0}
          aria-label="Submit guess"
        >
          ENTER
        </span>
        <span
          className={`${styles.key} ${styles.actionKey}`}
          style={{ background: actionBg, border: borderStyle, color: "white" }}
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
