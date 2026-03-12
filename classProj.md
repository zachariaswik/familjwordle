Wordle clone

This is a Wordle clone with the following potential features:

- Multi-game platform
- Leaderboards
- Customizable settings

Instructions

- ✅ Create a github repo
- ✅ Initialize a Vite project
- ✅ using TypeScript and React
- ❌ add the linting tooling, (with whatever config you prefer)
- ✅ add an informative README.md

App core: Wordle Clone

- ✅ Interface - Clean minimal board (Guesses.tsx) and keyboard (Keyboard.tsx) UI
- ✅ Guess - 5-letter guess submission with validation (logic.ts checkGuess)
- ✅ Keyboard - Letter key UI with aggregated color states (Keyboard.tsx, getLetterState)
- ✅ Guess history - View all submitted guesses on the board (Guesses.tsx)
- ✅ Logic - Two-pass scoring for correct duplicate-letter handling (logic.ts computeLetterStates)
- ⏳ Word selector - Currently hardcoded to "dizzy" (logic.ts State.word)
- ⏳ Word checker - Structural validation only; no dictionary check
- ✅ History state - Track guesses and letter states in State type

## Implementation Notes

### Core Components

- **logic.ts**: State model (State, Guess, LetterState) and scoring (getLetterState, checkGuess, computeLetterStates)
- **Play.tsx**: State management via useState; wires onChange/onSubmit handlers
- **Guesses.tsx**: Renders 6 rows of tiles with colors from getLetterState(position)
- **Keyboard.tsx**: Renders 3 rows of letter keys + Enter/Backspace; wires click handlers

### Key Algorithm Features

- Two-pass letter scoring prevents duplicate-letter miscounting (Pass 1: mark exact, Pass 2: mark present)
- Keyboard color uses precedence: correct > present > absent > unknown
- Supports both position-based (Guesses) and aggregated (Keyboard) state queries

### Current Limitations

- Word is hardcoded ("dizzy")
- No dictionary validation (accepts any 5-letter alphabetic guess)
- No win/lose messaging
- No persistence or leaderboard
