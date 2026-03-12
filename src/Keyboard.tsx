import styles from "./Keyboard.module.css"

const keyboard = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
]

const Keyboard: React.FC<{
  getState: (letter: string) => string
  onChange: (guess: string) => void
  onSubmit: () => boolean
}> = ({ getState, onChange, onSubmit }) => {
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
          {row.map((letter) => (
            <span
              key={letter}
              className={styles.key}
              style={{
                background: getState(letter),
              }}
              onClick={() => handleKeyClick(letter)}
              role="button"
              tabIndex={0}
            >
              {letter}
            </span>
          ))}
        </div>
      ))}
      <div className={styles.row}>
        <span
          className={`${styles.key} ${styles.actionKey}`}
          onClick={handleEnter}
          role="button"
          tabIndex={0}
          aria-label="Submit guess"
        >
          ENTER
        </span>
        <span
          className={`${styles.key} ${styles.actionKey}`}
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
