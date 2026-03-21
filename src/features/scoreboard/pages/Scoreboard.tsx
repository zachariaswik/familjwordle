import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"

import { type GameRecord } from "@features/stats/context/StatsContext"
import { useStats } from "@features/stats/context/StatsContext"
import { formatTime } from "@shared/lib/formatTime"

// Guesses are weighted heavily so fewer guesses always outranks faster time.
// Null times rank at the bottom of their guess group (value just below the
// weight so they don't bleed into the next guess bucket).
const GUESS_WEIGHT = 1000
const NULL_TIME_PENALTY = GUESS_WEIGHT - 1

export function rankScore(record: GameRecord): number {
  const time = record.timeTakenSeconds ?? NULL_TIME_PENALTY
  return record.guesses * GUESS_WEIGHT + time
}

function isToday(dateStr: string): boolean {
  const today = new Date().toLocaleDateString("sv-SE")
  const scoreDate = new Date(dateStr).toLocaleDateString("sv-SE")
  return scoreDate === today
}

const Scoreboard: React.FC = () => {
  const { history } = useStats()
  const rankedScores = history
    .filter((r) => isToday(r.date) && r.guesses > 1)
    .sort((a, b) => rankScore(a) - rankScore(b))

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        border: "1px solid",
        borderColor: "primary.light",
        background:
          "linear-gradient(180deg, rgba(45,212,191,0.08) 0%, rgba(255,255,255,1) 40%)",
      }}
    >
      <Typography variant="h3" color="primary.dark">
        Scoreboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </Typography>

      {rankedScores.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No scores yet. Win a game to see your scoreboard here!
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Guesses</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rankedScores.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{record.playerName}</TableCell>
                  <TableCell>{record.guesses}/6</TableCell>
                  <TableCell>
                    {record.timeTakenSeconds != null
                      ? formatTime(record.timeTakenSeconds)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}

export default Scoreboard
