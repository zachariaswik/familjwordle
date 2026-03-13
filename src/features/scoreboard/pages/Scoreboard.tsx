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

import { useStats } from "../../../contexts/StatsContext"

function isToday(dateStr: string): boolean {
  const today = new Date().toLocaleDateString("sv-SE")
  const scoreDate = new Date(dateStr).toLocaleDateString("sv-SE")
  return scoreDate === today
}

const Scoreboard: React.FC = () => {
  const { history } = useStats()
  const todayScores = history.filter((r) => isToday(r.date))

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

      {todayScores.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No scores yet. Win a game to see your scoreboard here!
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...todayScores].reverse().map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.playerName}</TableCell>
                  <TableCell>{record.guesses}/6</TableCell>
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
