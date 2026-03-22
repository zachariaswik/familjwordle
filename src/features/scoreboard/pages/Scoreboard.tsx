import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material"

import { type GameRecord } from "@features/stats/context/StatsContext"
import { useStats } from "@features/stats/context/StatsContext"
import { formatTime } from "@shared/lib/formatTime"

// Guesses are weighted heavily so fewer guesses always outranks faster time.
// Each hint penalises more than the worst possible no-hint score (6 guesses +
// max time), so any hint usage ranks below a clean 6-guess finish.
const HINT_PENALTY = 7000
const GUESS_WEIGHT = 1000
const NULL_TIME_PENALTY = GUESS_WEIGHT - 1

export function rankScore(record: GameRecord): number {
  const time = record.timeTakenSeconds ?? NULL_TIME_PENALTY
  return (
    (record.hintsUsed ?? 0) * HINT_PENALTY +
    record.guesses * GUESS_WEIGHT +
    time
  )
}

function isToday(dateStr: string): boolean {
  const today = new Date().toLocaleDateString("sv-SE")
  const scoreDate = new Date(dateStr).toLocaleDateString("sv-SE")
  return scoreDate === today
}

const MEDALS = ["🥇", "🥈", "🥉"]
const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"]

function RankCell({ rank }: { rank: number }) {
  const idx = rank - 1
  if (idx < 3) {
    return (
      <Box component="span" sx={{ color: MEDAL_COLORS[idx], fontWeight: 700 }}>
        {MEDALS[idx]} {rank}
      </Box>
    )
  }
  return <>{rank}</>
}

const Scoreboard: React.FC = () => {
  const theme = useTheme()
  const { history } = useStats()
  const rankedScores = history
    .filter((r) => isToday(r.date) && r.guesses > 1)
    .sort((a, b) => rankScore(a) - rankScore(b))

  // Guess distribution for today (guesses 2–6)
  const distribution: Record<number, number> = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  for (const r of rankedScores) {
    const g = r.guesses
    if (g >= 2 && g <= 6) {
      distribution[g]++
    }
  }
  const maxCount = Math.max(...Object.values(distribution), 1)

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        border: "1px solid",
        borderColor: "primary.light",
        background: `linear-gradient(180deg, rgba(45,212,191,0.08) 0%, ${theme.palette.background.paper} 40%)`,
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
        <>
          {/* Mobile: card list */}
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              flexDirection: "column",
              gap: 1,
            }}
          >
            {rankedScores.map((record, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    minWidth: 44,
                    fontSize: "0.95rem",
                  }}
                >
                  <RankCell rank={index + 1} />
                </Typography>
                <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                  {record.playerName}
                </Typography>
                <Typography
                  sx={{
                    mr: 2,
                    color: "text.secondary",
                    fontSize: "0.85rem",
                  }}
                >
                  {record.guesses}/6
                </Typography>
                {(record.hintsUsed ?? 0) > 0 && (
                  <Typography
                    sx={{
                      mr: 2,
                      color: "warning.main",
                      fontSize: "0.85rem",
                    }}
                  >
                    💡{record.hintsUsed}
                  </Typography>
                )}
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.85rem",
                    minWidth: 44,
                    textAlign: "right",
                  }}
                >
                  {record.timeTakenSeconds != null
                    ? formatTime(record.timeTakenSeconds)
                    : "—"}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Desktop: table */}
          <TableContainer sx={{ display: { xs: "none", sm: "block" } }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Guesses</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Hints</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankedScores.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <RankCell rank={index + 1} />
                    </TableCell>
                    <TableCell>{record.playerName}</TableCell>
                    <TableCell>{record.guesses}/6</TableCell>
                    <TableCell>
                      {(record.hintsUsed ?? 0) > 0
                        ? `💡 ${record.hintsUsed}`
                        : "—"}
                    </TableCell>
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

          {/* Guess distribution chart */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Today&apos;s guess distribution
            </Typography>
            {[2, 3, 4, 5, 6].map((g) => {
              const count = distribution[g]
              const barPct = (count / maxCount) * 100
              return (
                <Box
                  key={g}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 12, color: "text.secondary" }}
                  >
                    {g}
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: 18,
                      bgcolor: "action.selected",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${barPct}%`,
                        height: "100%",
                        bgcolor: "primary.main",
                        borderRadius: 1,
                        transition: "width 0.3s",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      minWidth: 16,
                      textAlign: "right",
                      color: "text.secondary",
                    }}
                  >
                    {count}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        </>
      )}
    </Paper>
  )
}

export default Scoreboard
