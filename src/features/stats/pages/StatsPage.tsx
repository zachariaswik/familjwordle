import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material"
import { useQuery } from "@tanstack/react-query"

import { usePlayerName } from "@features/player/hooks/usePlayerName"
import { fetchAllTimeScores } from "@features/stats/api/scoreApi"
import { useStats } from "@features/stats/context/StatsContext"
import { formatTime } from "@shared/lib/formatTime"

const StatsPage: React.FC = () => {
  const { gamesPlayed, gamesWon, currentStreak, bestStreak } = useStats()
  const { name } = usePlayerName()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["personalScores", name],
    queryFn: () => fetchAllTimeScores(1, 100, name),
    enabled: name.trim().length > 0,
  })

  const winRate =
    gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

  // Guess distribution from personal all-time scores
  const distribution: Record<number, number> = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  if (data?.scores) {
    for (const r of data.scores) {
      const g = r.guesses
      if (g >= 2 && g <= 6) {
        distribution[g]++
      }
    }
  }
  const maxCount = Math.max(...Object.values(distribution), 1)

  const recentGames = data?.scores.slice(0, 10) ?? []

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        border: "1px solid",
        borderColor: "primary.light",
      }}
    >
      <Typography variant="h3" color="primary.dark" gutterBottom>
        My Stats
      </Typography>
      {name.trim().length > 0 && (
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {name}
        </Typography>
      )}

      {/* Summary cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 2,
          mb: 4,
        }}
      >
        {[
          { label: "Win Rate", value: `${winRate}%` },
          { label: "Games Played", value: gamesPlayed },
          { label: "Current Streak", value: currentStreak },
          { label: "Best Streak", value: bestStreak },
        ].map(({ label, value }) => (
          <Card key={label} variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="primary.main" fontWeight={800}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Personal guess distribution */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Typography variant="body2" color="error" sx={{ mb: 3 }}>
          Could not load personal scores.
        </Typography>
      )}

      {data && (
        <>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Guess distribution
          </Typography>
          <Box sx={{ mb: 4 }}>
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
                      bgcolor: "grey.100",
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

          {/* Recent games */}
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Recent games
          </Typography>
          {recentGames.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No personal records found.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {recentGames.map((r, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    gap: 2,
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: "grey.50",
                    border: "1px solid",
                    borderColor: "grey.200",
                    fontSize: "0.875rem",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 70 }}
                  >
                    {new Date(r.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.word.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.guesses}/6
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.timeTakenSeconds != null
                      ? formatTime(r.timeTakenSeconds)
                      : "—"}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Paper>
  )
}

export default StatsPage
