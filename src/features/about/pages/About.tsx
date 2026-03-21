import { Box, Paper, Typography, useTheme } from "@mui/material"

const About: React.FC = () => {
  const theme = useTheme()
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
      <Typography variant="h3" color="primary.dark" gutterBottom>
        About Wordle
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" color="primary.dark" gutterBottom>
          What is Wordle?
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          component="p"
          sx={{ mb: 1 }}
        >
          Wordle is a word guessing game where you have 6 attempts to guess a
          randomly selected 5-letter word. After each guess, you receive
          feedback on which letters are correct and in the right position, which
          letters are in the word but in the wrong position, and which letters
          are not in the word at all.
        </Typography>

        <Typography
          variant="h6"
          color="primary.dark"
          gutterBottom
          sx={{ mt: 2 }}
        >
          How to Play
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          component="ol"
          sx={{ pl: 2 }}
        >
          <li>Type a valid 5-letter English word</li>
          <li>Press Enter to submit your guess</li>
          <li>Review the color feedback for each letter</li>
          <li>Use the feedback to refine your next guess</li>
          <li>Win by guessing the word before your 6 attempts run out</li>
        </Typography>

        <Typography
          variant="h6"
          color="primary.dark"
          gutterBottom
          sx={{ mt: 2 }}
        >
          Features
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Material UI themed design • Precise duplicate-letter handling •
          Color-coded feedback system • Multi-page navigation
        </Typography>
      </Box>
    </Paper>
  )
}

export default About
