import {
  Box,
  CircularProgress,
  Pagination,
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
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { fetchAllTimeScores } from "@features/stats/api/scoreApi"
import { formatTime } from "@shared/lib/formatTime"

const PAGE_SIZE = 20

const MEDALS = ["🥇", "🥈", "🥉"]
const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"]

function RankCell({ rank, page }: { rank: number; page: number }) {
  const idx = rank - 1
  if (page === 1 && idx < 3) {
    return (
      <Box component="span" sx={{ color: MEDAL_COLORS[idx], fontWeight: 700 }}>
        {MEDALS[idx]} {rank}
      </Box>
    )
  }
  return <>{rank}</>
}

const AllTimeScores: React.FC = () => {
  const theme = useTheme()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["allTimeScores", page],
    queryFn: () => fetchAllTimeScores(page, PAGE_SIZE),
  })

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
        All-Time Scores
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        All players, all time — sorted by skill
      </Typography>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Typography variant="body1" color="error">
          Could not load scores. Please try again later.
        </Typography>
      )}

      {data?.scores.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          No scores yet. Win a game to appear here!
        </Typography>
      )}

      {data && data.scores.length > 0 && (
        <>
          {/* Mobile: card list */}
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              flexDirection: "column",
              gap: 1,
            }}
          >
            {data.scores.map((record, index) => {
              const globalRank = (page - 1) * PAGE_SIZE + index + 1
              const dateStr = new Date(record.date).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                },
              )
              return (
                <Box
                  key={index}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        minWidth: 44,
                        fontSize: "0.95rem",
                      }}
                    >
                      <RankCell rank={globalRank} page={page} />
                    </Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {record.playerName}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      pl: "28px",
                      color: "text.secondary",
                      fontSize: "0.8rem",
                    }}
                  >
                    <Typography variant="caption">
                      {record.guesses}/6
                    </Typography>
                    <Typography variant="caption">·</Typography>
                    <Typography variant="caption">
                      {record.timeTakenSeconds != null
                        ? formatTime(record.timeTakenSeconds)
                        : "—"}
                    </Typography>
                    <Typography variant="caption">·</Typography>
                    <Typography variant="caption">{dateStr}</Typography>
                  </Box>
                </Box>
              )
            })}
          </Box>

          {/* Desktop: table */}
          <TableContainer sx={{ display: { xs: "none", sm: "block" } }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Guesses</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.scores.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <RankCell
                        rank={(page - 1) * PAGE_SIZE + index + 1}
                        page={page}
                      />
                    </TableCell>
                    <TableCell>{record.playerName}</TableCell>
                    <TableCell>{record.guesses}/6</TableCell>
                    <TableCell>
                      {record.timeTakenSeconds != null
                        ? formatTime(record.timeTakenSeconds)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {data.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 3 }}>
              <Pagination
                count={data.totalPages}
                page={page}
                onChange={(_e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  )
}

export default AllTimeScores
