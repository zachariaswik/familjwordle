# Wordle Clone

A Wordle clone implementation built with React and TypeScript.

## Features

- **Interface**: Clean, minimal board and keyboard UI
- **Guess**: Submit 5-letter guesses with real-time feedback
- **Keyboard**: Visual feedback on all letter states (correct, present, absent)
- **Guess History**: View all submitted guesses on the board
- **Logic**: Proper two-pass duplicate-letter handling and color precedence
- **History State**: Track game progression and letter states

## Project Structure

```
src/
  App.tsx              - Root application component
  Play.tsx             - Main game component with state management
  Guesses.tsx          - Board display (6 rows of letters)
  Keyboard.tsx         - Keyboard UI with key states
  logic.ts             - Core game logic and state types
  Guesses.module.css   - Board styling
  Keyboard.module.css  - Keyboard styling
  main.tsx             - React entry point
  index.ts             - Module exports
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens the game at `http://localhost:5173`

## Full-Stack Development (Frontend + Score API)

```bash
npm run dev:full
```

This starts:

- frontend on `http://localhost:5173`
- score API on `http://localhost:8787`

The API persists submitted scores in `server/data/scores.json`, so all clients using the same backend will see the same scoreboard.

### Backend API only

```bash
npm run start:api
```

## Build

```bash
npm run build
```

Produces optimized build in `dist/`

## Game Rules

- Guess the hidden word in 6 tries
- Each guess must be a valid 5-letter word (letters only)
- After each guess, tiles change color:
  - **Green**: Letter is in the word and in the correct position
  - **Yellow**: Letter is in the word but in the wrong position
  - **Gray**: Letter is not in the word

## Technical Implementation

### State Model

- `currentGuess`: In-progress guess being typed
- `guesses`: Array of submitted guesses with computed letter states
- `word`: Hidden target word

### Scoring Algorithm

Two-pass approach for correctness with duplicate letters:

1. **Pass 1**: Mark exact position matches (green)
2. **Pass 2**: Allocate remaining letters as present (yellow) or absent (gray)

### Keyboard Color Precedence

For each letter key across all submitted guesses:

- **Correct** (green) > **Present** (yellow) > **Absent** (gray) > **Unknown** (dark)

## Dependencies

- React 19
- React DOM 19
- TypeScript 5.9
- Vite 7
- classnames (for conditional CSS classes)
