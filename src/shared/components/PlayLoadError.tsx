import { Alert, Box, Button, Typography } from "@mui/material"

type PlayLoadErrorProps = {
  onRetry: () => void
}

const PlayLoadError: React.FC<PlayLoadErrorProps> = ({ onRetry }) => {
  return (
    <Box sx={{ py: 4, textAlign: "center" }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        Could not load a new word.
      </Alert>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Check your connection and try again.
      </Typography>
      <Button variant="contained" onClick={onRetry}>
        Retry
      </Button>
    </Box>
  )
}

export default PlayLoadError
