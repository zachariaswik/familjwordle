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

import { useStats } from "../contexts/StatsContext"

const History: React.FC = () => {
  const { history } = useStats()

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
      <Typography variant="h3" color="primary.dark" gutterBottom>
        Scores
      </Typography>

      {history.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No scores yet. Win a game to see your scoreboard here!
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Word</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...history].reverse().map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.playerName}</TableCell>
                  <TableCell
                    sx={{ textTransform: "uppercase", fontWeight: 600 }}
                  >
                    {record.word}
                  </TableCell>
                  <TableCell>{record.guesses}/6</TableCell>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString()}
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

export default History
